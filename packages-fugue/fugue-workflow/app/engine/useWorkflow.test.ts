import type { HandlerRegistry, InputConfig, StepConfig, WorkflowConfig, WorkflowContext } from '../types/workflow'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, reactive } from 'vue'
import { RecoverableActionError } from './actionRecovery'
import { deriveStepOrder } from './orderSteps'
import { filterVisibleInputs, inferMaxVisitedIndexFromContext, initInputValues, missingRequiredInputs, stepCanComplete, stepIsDraftComplete, useWorkflow, workflowValuesEqual } from './useWorkflow'
import { useWorkflowContext } from './useWorkflowContext'

function step(id: string, transitions: WorkflowConfig['steps'][number]['interactions']['transitions'] = []): WorkflowConfig['steps'][number] {
  return {
    id,
    title: id,
    interactions: { transitions },
  }
}

function arrayLinearConfig(
  steps: WorkflowConfig['steps'],
): WorkflowConfig {
  return {
    workflow: 'fallthrough',
    version: 1,
    entry: steps[0]!.id,
    basePath: '/flow',
    stepper: { order: 'array' },
    steps,
  }
}

let route: { path: string }
let navigateToMock: ReturnType<typeof vi.fn<(path: string) => Promise<void>>>

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  route = reactive({ path: '/flow' })
  navigateToMock = vi.fn(async (path: string) => {
    route.path = path
  })
  vi.stubGlobal('useRoute', () => route)
  vi.stubGlobal('useRouter', () => ({
    back: vi.fn(),
  }))
  vi.stubGlobal('navigateTo', navigateToMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

function computeNavigableStepIds(
  orderedStepIds: string[],
  currentStepId: string | undefined,
  maxVisitedIndex: number,
): string[] {
  const currentIndex = currentStepId
    ? orderedStepIds.indexOf(currentStepId)
    : -1
  const frontier = Math.max(maxVisitedIndex, currentIndex)
  return orderedStepIds.filter((id, index) => index <= frontier && id !== currentStepId)
}

describe('initInputValues', () => {
  const workloadStep = {
    id: 'workload',
    title: 'Workload',
    interactions: {
      inputs: [
        { field: 'deploymentName', type: 'text' as const },
        {
          field: 'workloadType',
          type: 'tiles' as const,
          default: 'static-site',
          options: [
            { id: 'static-site', label: 'Static' },
          ],
        },
      ],
      transitions: [],
    },
  }

  it('leaves a field unset when there is no default and Context is empty', () => {
    const noDefault = {
      ...workloadStep,
      interactions: {
        ...workloadStep.interactions,
        inputs: [
          {
            field: 'workloadType',
            type: 'tiles' as const,
            options: [
              { id: 'web-app', label: 'Web' },
            ],
          },
        ],
      },
    }
    expect(initInputValues(noDefault, () => undefined)).toEqual({})
  })

  it('seeds values from input.default when Context has no value', () => {
    expect(initInputValues(workloadStep, () => undefined)).toEqual({ workloadType: 'static-site' })
  })

  it('prefers Context over input.default', () => {
    expect(initInputValues(workloadStep, field => field === 'workloadType'
      ? 'web-app'
      : undefined))
      .toEqual({ workloadType: 'web-app' })
  })

  it('does not write defaults into Context on step enter', async () => {
    const config = arrayLinearConfig([
      {
        id: 'a',
        title: 'A',
        interactions: {
          inputs: [
            {
              field: 'source',
              type: 'choice',
              default: 'github',
              choices: ['github', 'local'],
            },
          ],
          transitions: [
            { target: 'b' },
          ],
        },
      },
      step('b'),
    ])
    route.path = '/flow'
    const workflow = useWorkflow({ config, registry: {} })
    await nextTick()

    expect(workflow.values.value).toEqual({ source: 'github' })
    expect(workflow.context.value.source).toBeUndefined()
  })

  it('clones object defaults so mutating seeded values does not mutate StepConfig.default', () => {
    const defaultValue = {
      nested: ['a'],
    }
    const stepWithObjectDefault = {
      id: 'config',
      title: 'Config',
      interactions: {
        inputs: [
          { field: 'settings', type: 'text' as const, default: defaultValue },
        ],
        transitions: [],
      },
    }
    const seeded = initInputValues(stepWithObjectDefault, () => undefined)
    ;(seeded.settings as { nested: string[] }).nested.push('b')
    expect(defaultValue).toEqual({
      nested: ['a'],
    })
  })
})

describe('filterVisibleInputs', () => {
  const inputs: InputConfig[] = [
    { field: 'mode', type: 'choice', required: true },
    {
      field: 'groupId',
      type: 'text',
      required: true,
      when: 'mode == \'existing-group\'',
    },
    {
      field: 'serviceName',
      type: 'text',
      required: true,
      when: 'mode == \'new-service\'',
    },
  ]

  it('returns inputs without a when guard and those whose guard passes', () => {
    const visible = filterVisibleInputs(inputs, { mode: 'existing-group' }, {})
    expect(visible.map(input => input.field)).toEqual(['mode', 'groupId'])
  })

  it('excludes inputs whose when guard is false', () => {
    const visible = filterVisibleInputs(inputs, { mode: 'new-service' }, {})
    expect(visible.map(input => input.field)).toEqual(['mode', 'serviceName'])
  })
})

describe('stepCanComplete', () => {
  it('ignores required values and errors on hidden inputs', () => {
    const inputs: InputConfig[] = [
      { field: 'mode', type: 'choice', required: true },
      {
        field: 'groupId',
        type: 'text',
        required: true,
        when: 'mode == \'existing-group\'',
      },
      {
        field: 'serviceName',
        type: 'text',
        required: true,
        when: 'mode == \'new-service\'',
      },
    ]

    const ctx = { mode: 'existing-group' }
    const visible = filterVisibleInputs(inputs, ctx, {})
    const values = { mode: 'existing-group', groupId: 'team-a' }
    const fieldErrors = { serviceName: 'Required' }

    expect(stepCanComplete(visible, values, fieldErrors)).toBe(true)
  })

  it('blocks completion when a visible required input is empty or has an error', () => {
    const inputs: InputConfig[] = [
      { field: 'mode', type: 'choice', required: true },
      {
        field: 'groupId',
        type: 'text',
        required: true,
        when: 'mode == \'existing-group\'',
      },
    ]

    const visible = filterVisibleInputs(inputs, { mode: 'existing-group' }, {})

    expect(stepCanComplete(visible, { mode: 'existing-group' }, {})).toBe(false)
    expect(stepCanComplete(visible, { mode: 'existing-group', groupId: 'team-a' }, { groupId: 'Invalid' })).toBe(false)
  })
})

describe('missingRequiredInputs', () => {
  const inputs: InputConfig[] = [
    { field: 'deploymentName', type: 'text', required: true },
    { field: 'workloadType', type: 'tiles', required: true },
    { field: 'notes', type: 'text' },
  ]

  it('reports required fields that are empty, in field order', () => {
    expect(missingRequiredInputs(inputs, {}).map(input => input.field))
      .toEqual(['deploymentName', 'workloadType'])
  })

  it('drops a field once it holds a value and ignores optional fields', () => {
    expect(missingRequiredInputs(inputs, { workloadType: 'web-app' }).map(input => input.field))
      .toEqual(['deploymentName'])
    expect(missingRequiredInputs(inputs, { deploymentName: 'demo', workloadType: 'web-app' }))
      .toEqual([])
  })

  it('treats empty string as missing but keeps false and 0', () => {
    const flags: InputConfig[] = [
      { field: 'blank', type: 'text', required: true },
      { field: 'enabled', type: 'toggle', required: true },
      { field: 'count', type: 'number', required: true },
    ]
    expect(missingRequiredInputs(flags, { blank: '', enabled: false, count: 0 }).map(input => input.field))
      .toEqual(['blank'])
  })

  it('treats empty multiselect as missing but keeps selected values', () => {
    const inputs: InputConfig[] = [
      { field: 'tags', type: 'multiselect', required: true },
    ]
    expect(missingRequiredInputs(inputs, { tags: [] }).map(input => input.field))
      .toEqual(['tags'])
    expect(missingRequiredInputs(inputs, {
      tags: ['x'],
    }))
      .toEqual([])
  })

  it('treats empty keyValue as missing but keeps populated objects', () => {
    const inputs: InputConfig[] = [
      { field: 'env', type: 'keyValue', required: true },
    ]
    expect(missingRequiredInputs(inputs, { env: {} }).map(input => input.field))
      .toEqual(['env'])
    expect(missingRequiredInputs(inputs, {
      env: { a: '1' },
    }))
      .toEqual([])
  })
})

describe('missingRequiredInputs with composite inputs', () => {
  const inputs: InputConfig[] = [
    {
      field: 'sourceArchive',
      type: 'composite',
      component: 'sourceArchiveUpload',
      required: true,
    },
  ]

  it('gates on reported readiness, not on holding a value', () => {
    // A composite can carry a value while its interaction is still unfinished — an
    // upload session with no artifact yet. Only `ready` clears the requirement.
    const halfDone = {
      sourceArchive: { fileName: 'app.zip' },
    }
    expect(missingRequiredInputs(inputs, halfDone).map(input => input.field))
      .toEqual(['sourceArchive'])
    expect(missingRequiredInputs(inputs, halfDone, { sourceArchive: true })).toEqual([])
  })

  it('stays unsatisfied when ready is reported for a different field', () => {
    expect(missingRequiredInputs(inputs, {}, { somethingElse: true }).map(input => input.field))
      .toEqual(['sourceArchive'])
  })

  it('ignores readiness for an optional composite', () => {
    const optional: InputConfig[] = [
      { field: 'sourceArchive', type: 'composite', component: 'sourceArchiveUpload' },
    ]
    expect(missingRequiredInputs(optional, {}, {})).toEqual([])
  })

  it('blocks completion while a composite reports an error, even when ready', () => {
    expect(stepCanComplete(inputs, {}, {}, { sourceArchive: true })).toBe(true)
    expect(stepCanComplete(inputs, {}, { sourceArchive: 'Upload failed' }, { sourceArchive: true }))
      .toBe(false)
  })
})

describe('navigableStepIds frontier over derived order', () => {
  const config = {
    workflow: 'nav',
    version: 1,
    entry: 'a',
    basePath: '/nav',
    stepper: { navigable: true },
    steps: [
      {
        id: 'c',
        title: 'C',
        interactions: {
          transitions: [
            { target: 'd' },
          ],
        },
      },
      {
        id: 'a',
        title: 'A',
        interactions: {
          transitions: [
            { target: 'b' },
          ],
        },
      },
      {
        id: 'b',
        title: 'B',
        interactions: {
          transitions: [
            { target: 'c' },
          ],
        },
      },
      {
        id: 'd',
        title: 'D',
        interactions: {
          transitions: [
            { target: '/done' },
          ],
        },
      },
    ],
  }

  it('uses transition-derived order for the completed frontier', () => {
    const orderedIds = deriveStepOrder(config).map(step => step.id)
    expect(orderedIds).toEqual(['a', 'b', 'c', 'd'])
    expect(computeNavigableStepIds(orderedIds, 'b', 2)).toEqual(['a', 'c'])
  })

  it('drops steps that opt out of navigation via their own stepper block', () => {
    const optOut: WorkflowConfig = {
      ...config,
      steps: config.steps.map(step =>
        step.id === 'a'
          ? {
              ...step,
              stepper: { navigable: false },
            }
          : step,
      ),
    }
    route.path = '/nav/b'
    const workflow = useWorkflow({ config: optOut, registry: {} })

    expect(workflow.navigableStepIds.value).toEqual([])
  })

  it('lets a step opt in when the flow-wide default is off', () => {
    const optIn: WorkflowConfig = {
      ...config,
      stepper: undefined,
      steps: config.steps.map(step =>
        step.id === 'a'
          ? {
              ...step,
              stepper: { navigable: true },
            }
          : step,
      ),
    }
    route.path = '/nav/b'
    const workflow = useWorkflow({ config: optIn, registry: {} })

    expect(workflow.navigableStepIds.value).toEqual(['a'])
  })

  it('labels bullets from stepper.label, falling back to the step title', () => {
    const labelled: WorkflowConfig = {
      ...config,
      steps: config.steps.map(step =>
        step.id === 'a'
          ? {
              ...step,
              stepper: { label: 'Start', description: 'First stop' },
            }
          : step,
      ),
    }
    route.path = '/nav'
    const workflow = useWorkflow({ config: labelled, registry: {} })

    expect(workflow.steps.value.find(item => item.id === 'a')).toEqual({
      id: 'a',
      label: 'Start',
      description: 'First stop',
    })
    expect(workflow.steps.value.find(item => item.id === 'b')?.label).toBe('B')
  })
})

describe('composite readiness against the completed frontier', () => {
  const config: WorkflowConfig = {
    workflow: 'composite-frontier',
    version: 1,
    entry: 'upload',
    basePath: '/flow',
    stepper: { navigable: true, order: 'array' },
    steps: [
      {
        id: 'upload',
        title: 'Upload',
        interactions: {
          inputs: [
            {
              field: 'archive',
              type: 'composite',
              component: 'archiveUpload',
              required: true,
            },
          ],
          transitions: [
            { target: 'security' },
          ],
        },
      },
      {
        id: 'security',
        title: 'Security',
        interactions: {
          transitions: [
            { target: 'review' },
          ],
        },
      },
      {
        id: 'review',
        title: 'Review',
        interactions: { transitions: [] },
      },
    ],
  }

  /** Walk to the last step, then return to the composite step with the frontier grown. */
  async function backOnUploadStep() {
    route.path = '/flow/review'
    const workflow = useWorkflow({ config, registry: {} })
    route.path = '/flow'
    await nextTick()
    return workflow
  }

  it('pulls the frontier back when a composite stops being ready', async () => {
    const workflow = await backOnUploadStep()
    expect(workflow.navigableStepIds.value).toEqual(['security', 'review'])

    workflow.setCompositeReady('archive', true)
    expect(workflow.navigableStepIds.value).toEqual(['security', 'review'])

    // Readiness can drop without the value changing, so `setValue` never runs here —
    // without its own invalidation the stepper would still offer the forward steps.
    workflow.setCompositeReady('archive', false)
    expect(workflow.navigableStepIds.value).toEqual([])
    expect(workflow.canComplete.value).toBe(false)
  })

  it('keeps the frontier when a freshly mounted composite first reports unready', async () => {
    const workflow = await backOnUploadStep()

    // Step entry clears reported readiness and the component re-reports from scratch;
    // that first `false` is not the user undoing anything.
    workflow.setCompositeReady('archive', false)

    expect(workflow.navigableStepIds.value).toEqual(['security', 'review'])
  })
})

describe('array-mode implicit linear fall-through', () => {
  it('advances to the next array step when the current step has no transitions', async () => {
    const config = arrayLinearConfig([
      step('a'),
      step('b'),
    ])
    route.path = '/flow'
    const workflow = useWorkflow({ config, registry: {} })

    await workflow.advance()

    expect(navigateToMock).toHaveBeenCalledWith('/flow/b')
  })

  it('follows a matching conditional branch instead of array fall-through', async () => {
    const config = arrayLinearConfig([
      {
        ...step('a'),
        interactions: {
          transitions: [
            { when: 'mode == \'branch\'', target: 'skip' },
          ],
        },
      },
      step('b'),
      step('skip'),
    ])
    route.path = '/flow'
    const workflow = useWorkflow({ config, registry: {} })

    workflow.setValue('mode', 'branch')
    await workflow.advance()
    expect(navigateToMock).toHaveBeenCalledWith('/flow/skip')

    navigateToMock.mockClear()
    route.path = '/flow'
    workflow.setValue('mode', 'linear')
    await workflow.advance()
    expect(navigateToMock).toHaveBeenCalledWith('/flow/b')
  })

  it('uses an explicit unconditional target instead of array fall-through', async () => {
    const config = arrayLinearConfig([
      {
        ...step('a'),
        interactions: {
          transitions: [
            { target: 'skip' },
          ],
        },
      },
      step('b'),
      step('skip'),
    ])
    route.path = '/flow'
    const workflow = useWorkflow({ config, registry: {} })

    await workflow.advance()

    expect(navigateToMock).toHaveBeenCalledWith('/flow/skip')
  })

  it('does not advance past the last array step', async () => {
    const config = arrayLinearConfig([
      step('a'),
      step('b'),
    ])
    route.path = '/flow/b'
    const workflow = useWorkflow({ config, registry: {} })

    await workflow.advance()

    expect(navigateToMock).not.toHaveBeenCalled()
  })
})

describe('overlay step presentation projection', () => {
  const config = arrayLinearConfig([
    step('source'),
    {
      ...step('githubDetails'),
      presentation: 'drawer',
      requires: ['source'],
      interactions: {
        inputs: [
          { field: 'deploymentName', type: 'text', required: true },
        ],
        transitions: [
          { target: 'security' },
        ],
      },
    },
    {
      ...step('uploadDetails'),
      presentation: 'modal',
      requires: ['source'],
      interactions: {
        inputs: [
          { field: 'sourceArchive', type: 'text', required: true },
        ],
        transitions: [
          { target: 'security' },
        ],
      },
    },
    step('security'),
  ])

  it('excludes overlay steps from stepper bullets but keeps them in derived order', () => {
    const orderedIds = deriveStepOrder(config).map(s => s.id)
    expect(orderedIds).toEqual([
      'source',
      'githubDetails',
      'uploadDetails',
      'security',
    ])

    route.path = '/flow'
    const workflow = useWorkflow({ config, registry: {} })
    expect(workflow.steps.value.map(s => s.id)).toEqual(['source', 'security'])
  })

  it('excludes overlay steps from navigableStepIds', () => {
    const navigableConfig = {
      ...config,
      stepper: { navigable: true, order: 'array' as const },
    }
    route.path = '/flow/security'
    const workflow = useWorkflow({ config: navigableConfig, registry: {} })

    expect(workflow.navigableStepIds.value).toEqual(['source'])
  })

  it('still advances from overlay steps through the flow graph', async () => {
    route.path = '/flow'
    const workflow = useWorkflow({ config, registry: {} })

    workflow.setValue('source', 'github')
    await workflow.advance()
    expect(route.path).toBe('/flow/githubDetails')

    navigateToMock.mockClear()
    workflow.setValue('deploymentName', 'demo-site')
    await workflow.advance()

    expect(navigateToMock).toHaveBeenCalledWith('/flow/security')
  })
})

describe('transition mode and event-driven navigation', () => {
  it('does not fall through on plain advance in transition mode', async () => {
    const config = {
      workflow: 'transition',
      version: 1,
      entry: 'a',
      basePath: '/flow',
      steps: [
        step('a'),
        step('b'),
      ],
    } satisfies WorkflowConfig
    route.path = '/flow'
    const workflow = useWorkflow({ config, registry: {} })

    await workflow.advance()

    expect(navigateToMock).not.toHaveBeenCalled()
  })

  it('does not fall through when runAction fires an event with no matching transition', async () => {
    const config = arrayLinearConfig([
      {
        ...step('a'),
        interactions: {
          actions: [
            {
              id: 'submit',
              label: 'Submit',
              effect: 'fetch',
              handler: 'loadData',
            },
          ],
          transitions: [
            { on: 'other.success', target: 'skip' },
          ],
        },
      },
      step('b'),
      step('skip'),
    ])
    const registry: HandlerRegistry = {
      loaders: {
        loadData: async () => ({ ok: true }),
      },
    }
    route.path = '/flow'
    const workflow = useWorkflow({ config, registry })

    await workflow.runAction('submit')

    expect(navigateToMock).not.toHaveBeenCalled()
  })
})

describe('action failure recovery', () => {
  function submitFlow(onError: 'stay' | string): WorkflowConfig {
    return arrayLinearConfig([
      // `archive` must not be the entry step, whose route is the bare basePath.
      step('start'),
      step('archive'),
      {
        ...step('submit'),
        interactions: {
          actions: [
            {
              id: 'submit',
              label: 'Deploy',
              effect: 'mutate',
              handler: 'deploy',
              onError,
            },
          ],
          transitions: [
            { on: 'submit.success', target: 'done' },
          ],
        },
      },
      step('done'),
    ])
  }

  function runFailingSubmit(config: WorkflowConfig, err: unknown) {
    const registry: HandlerRegistry = {
      actions: {
        deploy: () => {
          throw err
        },
      },
    }
    route.path = '/flow/submit'
    return useWorkflow({ config, registry })
  }

  it('routes to the step a handler names for recovery', async () => {
    const workflow = runFailingSubmit(
      submitFlow('stay'),
      new RecoverableActionError('archive expired', 'archive'),
    )

    await workflow.runAction('submit')

    expect(navigateToMock).toHaveBeenCalledWith('/flow/archive')
    expect(workflow.effects.value['mutate:deploy']?.status).toBe('error')
  })

  it('stays on the step for a failure with nowhere to recover to', async () => {
    const workflow = runFailingSubmit(submitFlow('stay'), new Error('quota exceeded'))

    await workflow.runAction('submit')

    expect(navigateToMock).not.toHaveBeenCalled()
    expect(workflow.effects.value['mutate:deploy']?.status).toBe('error')
  })

  it('takes the handler target over the action-wide onError', async () => {
    const workflow = runFailingSubmit(
      submitFlow('done'),
      new RecoverableActionError('archive expired', 'archive'),
    )

    await workflow.runAction('submit')

    expect(navigateToMock).toHaveBeenCalledWith('/flow/archive')
  })

  it('still falls back to onError for failures no handler classified', async () => {
    const workflow = runFailingSubmit(submitFlow('archive'), new Error('quota exceeded'))

    await workflow.runAction('submit')

    expect(navigateToMock).toHaveBeenCalledWith('/flow/archive')
  })
})

describe('advance validation feedback', () => {
  it('sets showValidation instead of navigating when required inputs are empty', async () => {
    const config = arrayLinearConfig([
      {
        id: 'a',
        title: 'A',
        interactions: {
          inputs: [
            { field: 'name', type: 'text', required: true },
          ],
          transitions: [
            { target: 'b' },
          ],
        },
      },
      step('b', [
        { target: '/done' },
      ]),
    ])
    route.path = '/flow'
    const workflow = useWorkflow({ config, registry: {} })

    await workflow.advance()

    expect(workflow.showValidation.value).toBe(true)
    expect(navigateToMock).not.toHaveBeenCalled()
  })

  it('navigates when the step can complete', async () => {
    const config = arrayLinearConfig([
      {
        id: 'a',
        title: 'A',
        interactions: {
          inputs: [
            { field: 'name', type: 'text', required: true },
          ],
          transitions: [
            { target: 'b' },
          ],
        },
      },
      step('b', [
        { target: '/done' },
      ]),
    ])
    route.path = '/flow'
    const workflow = useWorkflow({ config, registry: {} })
    workflow.setValue('name', 'demo')

    await workflow.advance()

    expect(workflow.showValidation.value).toBe(false)
    expect(navigateToMock).toHaveBeenCalled()
  })

  it('sets showValidation instead of running mutate when step is incomplete', async () => {
    const deployMock = vi.fn()
    const config = arrayLinearConfig([
      {
        id: 'a',
        title: 'A',
        interactions: {
          inputs: [
            { field: 'name', type: 'text', required: true },
          ],
          actions: [
            {
              id: 'deploy',
              label: 'Deploy',
              effect: 'mutate',
              handler: 'deploy',
            },
          ],
          transitions: [
            { on: 'deploy.success', target: 'b' },
          ],
        },
      },
      step('b'),
    ])
    route.path = '/flow'
    const workflow = useWorkflow({
      config,
      registry: {
        actions: { deploy: deployMock },
      },
    })

    await workflow.runAction('deploy')

    expect(workflow.showValidation.value).toBe(true)
    expect(deployMock).not.toHaveBeenCalled()
    expect(navigateToMock).not.toHaveBeenCalled()
  })

  it('sets showValidation instead of running fetch when step is incomplete', async () => {
    const loadMock = vi.fn()
    const config = arrayLinearConfig([
      {
        id: 'a',
        title: 'A',
        interactions: {
          inputs: [
            { field: 'name', type: 'text', required: true },
          ],
          actions: [
            {
              id: 'load',
              label: 'Load',
              effect: 'fetch',
              handler: 'loadData',
            },
          ],
          transitions: [
            { on: 'load.success', target: 'b' },
          ],
        },
      },
      step('b'),
    ])
    route.path = '/flow'
    const workflow = useWorkflow({
      config,
      registry: {
        loaders: { loadData: loadMock },
      },
    })

    await workflow.runAction('load')

    expect(workflow.showValidation.value).toBe(true)
    expect(loadMock).not.toHaveBeenCalled()
    expect(navigateToMock).not.toHaveBeenCalled()
  })
})

describe('workflowValuesEqual', () => {
  it('treats structurally equal objects as unchanged', () => {
    expect(workflowValuesEqual({
      a: 1,
      b: [2],
    }, {
      a: 1,
      b: [2],
    })).toBe(true)
    expect(workflowValuesEqual({ a: 1 }, { a: 2 })).toBe(false)
  })

  it('compares plain objects independent of key order', () => {
    expect(workflowValuesEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true)
  })

  it('uses reference equality for primitives', () => {
    expect(workflowValuesEqual('x', 'x')).toBe(true)
    expect(workflowValuesEqual(0, false)).toBe(false)
  })
})

describe('inferMaxVisitedIndexFromContext', () => {
  const orderedSteps = [
    {
      id: 'a',
      title: 'A',
      interactions: { transitions: [] },
      output: {
        produces: ['mode'],
      },
    },
    {
      id: 'b',
      title: 'B',
      interactions: { transitions: [] },
      output: {
        produces: ['name'],
      },
    },
    {
      id: 'c',
      title: 'C',
      interactions: { transitions: [] },
      output: {
        produces: ['review'],
      },
    },
  ]

  it('returns the furthest contiguous step whose produced keys are all present', () => {
    const hasValue = (key: string) => key === 'mode' || key === 'name'
    expect(inferMaxVisitedIndexFromContext(orderedSteps, hasValue)).toBe(1)
  })

  it('stops at the first incomplete required inline step', () => {
    const hasValue = (key: string) => key === 'mode' || key === 'name' || key === 'review'
    expect(inferMaxVisitedIndexFromContext(orderedSteps, hasValue)).toBe(2)
  })

  it('soft-skips incomplete optional steps without blocking later steps', () => {
    const steps = [
      {
        id: 'workload',
        title: 'Workload',
        interactions: { transitions: [] },
        output: {
          produces: ['workloadType'],
        },
      },
      {
        id: 'link',
        title: 'Link',
        optional: true,
        interactions: { transitions: [] },
        output: {
          produces: ['projectId'],
        },
      },
      {
        id: 'configure',
        title: 'Configure',
        requires: ['workloadType'],
        interactions: {
          inputs: [
            {
              field: 'regions',
              type: 'composite',
              required: true,
              when: 'workloadType == \'static-site\'',
            },
          ],
          transitions: [],
        },
        output: {
          produces: ['deploymentId'],
        },
      },
    ] as StepConfig[]
    const context = {
      workloadType: 'static-site',
      regions: ['us-west-2'],
    }
    const hasValue = (key: string) => context[key as keyof typeof context] !== undefined
    expect(inferMaxVisitedIndexFromContext(steps, hasValue, context)).toBe(2)
  })

  it('soft-skips incomplete overlay steps without blocking later steps', () => {
    const steps = [
      {
        id: 'source',
        title: 'Source',
        interactions: { transitions: [] },
        output: {
          produces: ['source'],
        },
      },
      {
        id: 'branch',
        title: 'Branch',
        presentation: 'drawer' as const,
        interactions: { transitions: [] },
        output: {
          produces: ['branchChoice'],
        },
      },
      {
        id: 'security',
        title: 'Security',
        requires: ['source'],
        interactions: { transitions: [] },
        output: {
          produces: ['security'],
        },
      },
    ] as StepConfig[]
    const context = { source: 'upload', security: 'ok' }
    const hasValue = (key: string) => context[key as keyof typeof context] !== undefined
    expect(inferMaxVisitedIndexFromContext(steps, hasValue, context)).toBe(2)
  })

  it('extends the frontier from required input values without deploy produces', () => {
    const steps = [
      {
        id: 'workload',
        title: 'Workload',
        interactions: { transitions: [] },
        output: {
          produces: ['workloadType', 'deploymentName'],
        },
      },
      {
        id: 'link',
        title: 'Link',
        optional: true,
        interactions: { transitions: [] },
        output: {
          produces: ['projectId'],
        },
      },
      {
        id: 'configure',
        title: 'Configure',
        requires: ['workloadType', 'deploymentName'],
        interactions: {
          inputs: [
            {
              field: 'regions',
              type: 'composite',
              required: true,
              when: 'workloadType == \'static-site\'',
            },
          ],
          transitions: [],
        },
        output: {
          produces: ['deploymentId', 'appId'],
        },
      },
    ] as StepConfig[]
    const context = {
      workloadType: 'static-site',
      deploymentName: 'demo',
      regions: ['us-west-2'],
    }
    const hasValue = (key: string) => {
      const value = context[key as keyof typeof context]
      return value !== undefined && value !== ''
    }
    expect(inferMaxVisitedIndexFromContext(steps, hasValue, context)).toBe(2)
  })

  it('does not extend past a terminal step before prior required steps are complete', () => {
    const steps = [
      {
        id: 'workload',
        title: 'Workload',
        interactions: { transitions: [] },
        output: {
          produces: ['workloadType'],
        },
      },
      {
        id: 'configure',
        title: 'Configure',
        requires: ['workloadType'],
        interactions: { transitions: [] },
        output: {
          produces: ['deploymentId'],
        },
      },
    ]
    const context = { deploymentId: 'dep-1' }
    const hasValue = (key: string) => context[key as keyof typeof context] !== undefined
    expect(inferMaxVisitedIndexFromContext(steps, hasValue, context)).toBe(0)
  })

  it('completes configure via requires when conditional inputs are hidden', () => {
    const steps = [
      {
        id: 'workload',
        title: 'Workload',
        interactions: { transitions: [] },
        output: {
          produces: ['workloadType', 'deploymentName'],
        },
      },
      {
        id: 'configure',
        title: 'Configure',
        requires: ['workloadType', 'deploymentName'],
        interactions: {
          inputs: [
            {
              field: 'regions',
              type: 'composite',
              required: true,
              when: 'workloadType == \'static-site\'',
            },
          ],
          transitions: [],
        },
        output: {
          produces: ['deploymentId', 'appId'],
        },
      },
    ] as StepConfig[]
    const context = { workloadType: 'web-app', deploymentName: 'demo' }
    const hasValue = (key: string) => context[key as keyof typeof context] !== undefined
    expect(inferMaxVisitedIndexFromContext(steps, hasValue, context)).toBe(1)
  })

  it('ignores steps that produce nothing and have no draft work', () => {
    const steps = [
      {
        id: 'a',
        title: 'A',
        interactions: { transitions: [] },
      },
      {
        id: 'b',
        title: 'B',
        interactions: { transitions: [] },
        output: {
          produces: ['mode'],
        },
      },
    ]
    expect(inferMaxVisitedIndexFromContext(steps, () => false)).toBe(0)
  })
})

describe('stepIsDraftComplete', () => {
  it('uses value presence for required composite inputs', () => {
    const step: StepConfig = {
      id: 'configure',
      title: 'Configure',
      interactions: {
        inputs: [
          { field: 'regions', type: 'composite', required: true },
        ],
        transitions: [],
      },
    }
    expect(stepIsDraftComplete(step, key => key === 'regions', {
      regions: ['us-west-2'],
    })).toBe(true)
    expect(stepIsDraftComplete(step, () => false, {})).toBe(false)
  })
})

describe('persisted frontier restore', () => {
  const config: WorkflowConfig = {
    workflow: 'persist-frontier',
    version: 3,
    entry: 'source',
    basePath: '/deploy',
    context: { persist: true },
    stepper: { navigable: true, order: 'array' },
    steps: [
      {
        id: 'source',
        title: 'Source',
        interactions: {
          transitions: [
            { target: 'upload' },
          ],
        },
        output: {
          produces: ['source'],
        },
      },
      {
        id: 'upload',
        title: 'Upload',
        interactions: {
          inputs: [
            {
              field: 'archive',
              type: 'composite',
              component: 'archiveUpload',
              required: true,
              invalidatesDownstream: true,
            },
            { field: 'uploadNote', type: 'text' },
          ],
          transitions: [
            { target: 'security' },
          ],
        },
        output: {
          produces: ['archive'],
        },
      },
      {
        id: 'security',
        title: 'Security',
        interactions: {
          transitions: [
            { target: 'review' },
          ],
        },
        output: {
          produces: ['security'],
        },
      },
      {
        id: 'review',
        title: 'Review',
        interactions: { transitions: [] },
      },
    ],
  }

  function seedDraft(context: Record<string, unknown>, maxVisitedStepId?: string) {
    localStorage.setItem('workflow:persist-frontier', JSON.stringify({
      version: 3,
      context,
      ...(maxVisitedStepId
        ? { maxVisitedStepId }
        : {}),
    }))
  }

  it('restores navigable steps from a persisted maxVisitedStepId after remount', async () => {
    seedDraft(
      {
        source: 'upload',
        archive: { artifactId: 'a1', uploadSessionId: 's1', fileName: 'app.zip' },
      },
      'security',
    )
    route.path = '/deploy/upload'
    const workflow = useWorkflow({ config, registry: {} })
    await nextTick()

    expect(workflow.navigableStepIds.value).toEqual(['source', 'security'])
  })

  it('infers the frontier from draft input satisfaction when no step id was stored', async () => {
    seedDraft({
      source: 'upload',
      archive: { artifactId: 'a1', uploadSessionId: 's1', fileName: 'app.zip' },
    })
    route.path = '/deploy/upload'
    const workflow = useWorkflow({ config, registry: {} })
    await nextTick()

    expect(workflow.maxVisitedIndex.value).toBe(1)

    setActivePinia(createPinia())
    route.path = '/deploy'
    const fromEntry = useWorkflow({ config, registry: {} })
    await nextTick()
    expect(fromEntry.navigableStepIds.value).toEqual(['upload'])
  })

  it('infers the frontier when a stored step id no longer exists in the workflow', async () => {
    seedDraft(
      {
        source: 'upload',
        archive: { artifactId: 'a1', uploadSessionId: 's1', fileName: 'app.zip' },
      },
      'removed-step',
    )
    route.path = '/deploy/upload'
    const workflow = useWorkflow({ config, registry: {} })
    await nextTick()

    expect(workflow.maxVisitedIndex.value).toBe(1)
  })

  it('persists maxVisitedStepId as the user walks forward', async () => {
    route.path = '/deploy'
    const workflow = useWorkflow({ config, registry: {} })
    workflow.setValue('source', 'upload')
    await workflow.advance()
    await nextTick()

    const ctx = useWorkflowContext('persist-frontier', { version: 3, persist: true })
    expect(ctx.maxVisitedStepId.value).toBe('upload')
  })

  it('does not clear downstream keys when setValue receives a deep-equal object', async () => {
    const archive = { artifactId: 'a1', uploadSessionId: 's1', fileName: 'app.zip' }
    seedDraft(
      { source: 'upload', archive, security: 'ok' },
      'security',
    )
    route.path = '/deploy/upload'
    const workflow = useWorkflow({ config, registry: {} })
    await nextTick()

    // Composite upload components use sourceArchiveUploadValuesEqual (deploy-sources layer)
    // before emitting; the engine's workflowValuesEqual guard here is the same contract.
    workflow.setValue('archive', { ...archive })

    const ctx = useWorkflowContext('persist-frontier', { version: 3, persist: true })
    expect(ctx.state.value.security).toBe('ok')
    expect(workflow.navigableStepIds.value).toContain('security')
  })

  it('refresh remount keeps forward jumps when landing on entry', async () => {
    seedDraft(
      {
        source: 'upload',
        archive: { artifactId: 'a1', uploadSessionId: 's1', fileName: 'app.zip' },
        security: 'ok',
      },
      'security',
    )
    route.path = '/deploy/security'
    useWorkflow({ config, registry: {} })
    await nextTick()

    setActivePinia(createPinia())
    route.path = '/deploy'
    const workflow = useWorkflow({ config, registry: {} })
    await nextTick()

    expect(workflow.navigableStepIds.value).toEqual(['upload', 'security'])
  })

  it('remount mid-flow allows jumping back and forward', async () => {
    seedDraft(
      {
        source: 'upload',
        archive: { artifactId: 'a1', uploadSessionId: 's1', fileName: 'app.zip' },
        security: 'ok',
      },
      'security',
    )
    setActivePinia(createPinia())
    route.path = '/deploy/upload'
    const workflow = useWorkflow({ config, registry: {} })
    await nextTick()

    expect(workflow.navigableStepIds.value).toEqual(['source', 'security'])
  })

  it('clears downstream keys and shrinks frontier when an upstream value actually changes', async () => {
    const archive = { artifactId: 'a1', uploadSessionId: 's1', fileName: 'app.zip' }
    seedDraft(
      { source: 'upload', archive, security: 'ok' },
      'security',
    )
    route.path = '/deploy/upload'
    const workflow = useWorkflow({ config, registry: {} })
    await nextTick()

    workflow.setValue('archive', { ...archive, artifactId: 'different' })

    const ctx = useWorkflowContext('persist-frontier', { version: 3, persist: true })
    expect(ctx.state.value.security).toBeUndefined()
    expect(workflow.navigableStepIds.value).not.toContain('security')
    expect(workflow.navigableStepIds.value).toEqual(['source'])
  })

  it('does not clear downstream keys or shrink frontier when a field lacks invalidatesDownstream', async () => {
    const archive = { artifactId: 'a1', uploadSessionId: 's1', fileName: 'app.zip' }
    seedDraft(
      { source: 'upload', archive, security: 'ok' },
      'security',
    )
    route.path = '/deploy/upload'
    const workflow = useWorkflow({ config, registry: {} })
    await nextTick()

    workflow.setValue('uploadNote', 'renamed')

    const ctx = useWorkflowContext('persist-frontier', { version: 3, persist: true })
    expect(ctx.state.value.security).toBe('ok')
    expect(workflow.navigableStepIds.value).toContain('security')
  })
})

describe('reset', () => {
  const config: WorkflowConfig = {
    workflow: 'reset-test',
    version: 1,
    entry: 'a',
    basePath: '/deploy',
    context: { persist: true },
    stepper: { order: 'array' },
    steps: [
      {
        id: 'a',
        title: 'A',
        interactions: {
          inputs: [
            { field: 'name', type: 'text', required: true },
          ],
          transitions: [
            { target: 'b' },
          ],
        },
      },
      step('b'),
    ],
  }

  it('clears persisted context and step-local engine state', async () => {
    localStorage.setItem('workflow:reset-test', JSON.stringify({
      version: 1,
      context: { name: 'demo' },
      maxVisitedStepId: 'b',
    }))
    route.path = '/deploy'
    const workflow = useWorkflow({ config, registry: {} })
    await nextTick()
    workflow.setValue('name', 'demo')
    workflow.setFieldError('name', 'bad')
    workflow.setCompositeReady('name', true)
    workflow.showValidation.value = true

    workflow.reset()
    await nextTick()

    const ctx = useWorkflowContext('reset-test', { version: 1, persist: true })
    expect(ctx.state.value).toEqual({})
    expect(localStorage.getItem('workflow:reset-test')).toBeNull()
    expect(workflow.values.value).toEqual({})
    expect(workflow.fieldErrors.value).toEqual({})
    expect(workflow.effects.value).toEqual({})
    expect(workflow.fieldOptions.value).toEqual({})
    expect(workflow.showValidation.value).toBe(false)
    expect(workflow.navigableStepIds.value).toEqual([])
  })
})

describe('isInputBusy', () => {
  it('excludes pending field validate from input busy while isBusy stays true', async () => {
    let resolveValidator!: (error: string | null) => void
    const validatorPromise = new Promise<string | null>((resolve) => {
      resolveValidator = error => resolve(error)
    })

    const config = arrayLinearConfig([
      {
        id: 'a',
        title: 'A',
        interactions: {
          inputs: [
            { field: 'code', type: 'text', validate: 'checkCode' },
          ],
          transitions: [],
        },
      },
    ])
    const registry: HandlerRegistry = {
      validators: {
        checkCode: async () => validatorPromise,
      },
    }
    route.path = '/flow'
    const workflow = useWorkflow({ config, registry })
    await nextTick()

    workflow.setValue('code', 'abc')
    await nextTick()

    expect(workflow.isBusy.value).toBe(true)
    expect(workflow.isInputBusy.value).toBe(false)

    resolveValidator(null)
    await nextTick()
    await validatorPromise

    expect(workflow.isBusy.value).toBe(false)
    expect(workflow.isInputBusy.value).toBe(false)
  })

  it('includes pending fetch in input busy', async () => {
    let resolveLoader!: (value: unknown) => void
    const loaderPromise = new Promise<unknown>((resolve) => {
      resolveLoader = resolve
    })

    const config = arrayLinearConfig([
      {
        id: 'a',
        title: 'A',
        interactions: {
          inputs: [
            {
              field: 'items',
              type: 'choice',
              source: { effect: 'fetch', handler: 'loadItems' },
            },
          ],
          transitions: [],
        },
      },
    ])
    const registry: HandlerRegistry = {
      loaders: {
        loadItems: async () => loaderPromise,
      },
    }
    route.path = '/flow'
    const workflow = useWorkflow({ config, registry })
    await nextTick()

    expect(workflow.isInputBusy.value).toBe(true)
    expect(workflow.isBusy.value).toBe(true)

    resolveLoader([])
    await nextTick()
    await loaderPromise
    await nextTick()

    expect(workflow.isInputBusy.value).toBe(false)
    expect(workflow.isBusy.value).toBe(false)
  })
})

describe('runGeneration guard', () => {
  it('ignores stale loader results after reset()', async () => {
    let resolveLoader!: (value: unknown) => void
    const loaderPromise = new Promise<unknown>((resolve) => {
      resolveLoader = resolve
    })

    const config = arrayLinearConfig([
      {
        id: 'a',
        title: 'A',
        interactions: {
          inputs: [
            {
              field: 'items',
              type: 'choice',
              source: { effect: 'fetch', handler: 'loadItems' },
            },
          ],
          transitions: [],
        },
      },
    ])
    const registry: HandlerRegistry = {
      loaders: {
        loadItems: async () => loaderPromise,
      },
    }
    route.path = '/flow'
    const workflow = useWorkflow({ config, registry })
    await nextTick()

    expect(workflow.effects.value['fetch:loadItems']?.status).toBe('loading')

    workflow.reset()
    expect(workflow.context.value).toEqual({})

    resolveLoader({
      items: ['stale'],
    })
    await nextTick()

    expect(workflow.context.value).toEqual({})
    expect(workflow.fieldOptions.value).toEqual({})
    expect(workflow.effects.value).toEqual({})
  })

  it('ignores stale mutate action results after reset()', async () => {
    let resolveAction!: (value: Partial<WorkflowContext>) => void
    const actionPromise = new Promise<Partial<WorkflowContext>>((resolve) => {
      resolveAction = resolve
    })

    const config = arrayLinearConfig([
      {
        ...step('a'),
        interactions: {
          actions: [
            {
              id: 'submit',
              label: 'Submit',
              effect: 'mutate',
              handler: 'deploy',
            },
          ],
          transitions: [
            { on: 'submit.success', target: 'b' },
          ],
        },
      },
      step('b'),
    ])
    const registry: HandlerRegistry = {
      actions: {
        deploy: async () => actionPromise,
      },
    }
    route.path = '/flow'
    const workflow = useWorkflow({ config, registry })

    const pending = workflow.runAction('submit')
    await nextTick()
    expect(workflow.effects.value['mutate:deploy']?.status).toBe('loading')

    workflow.reset()
    expect(workflow.context.value).toEqual({})

    resolveAction({ deployed: true })
    await pending
    await nextTick()

    expect(workflow.context.value).toEqual({})
    expect(workflow.effects.value).toEqual({})
    expect(navigateToMock).not.toHaveBeenCalled()
  })
})

describe('loadFromRecipe', () => {
  const recipeConfig: WorkflowConfig = {
    workflow: 'recipe-load',
    version: 1,
    entry: 'a',
    basePath: '/flow',
    stepper: { navigable: true, order: 'array' },
    context: {
      globals: ['projectId'],
    },
    steps: [
      {
        id: 'a',
        title: 'A',
        interactions: {
          inputs: [
            { field: 'name', type: 'text', required: true },
          ],
          transitions: [
            { target: 'b' },
          ],
        },
        output: {
          produces: ['name'],
        },
      },
      {
        id: 'b',
        title: 'B',
        interactions: {
          inputs: [
            { field: 'region', type: 'text' },
          ],
          transitions: [
            { target: 'c' },
          ],
        },
        output: {
          produces: ['region'],
        },
      },
      {
        id: 'c',
        title: 'C',
        interactions: { transitions: [] },
        output: {
          produces: ['done'],
        },
      },
    ],
  }

  it('reseeds entry-step values when already on the entry route', async () => {
    route.path = '/flow'
    const workflow = useWorkflow({ config: recipeConfig, registry: {} })
    await nextTick()

    expect(workflow.values.value).toEqual({})

    await workflow.loadFromRecipe({ name: 'from-recipe' })
    await nextTick()

    expect(workflow.context.value.name).toBe('from-recipe')
    expect(workflow.values.value).toEqual({ name: 'from-recipe' })
    expect(navigateToMock).not.toHaveBeenCalled()
  })

  it('navigates to entry when loading from another step', async () => {
    route.path = '/flow/b'
    const workflow = useWorkflow({ config: recipeConfig, registry: {} })
    await nextTick()

    await workflow.loadFromRecipe({ name: 'from-recipe', region: 'us-west' })
    await nextTick()

    expect(navigateToMock).toHaveBeenCalledWith('/flow')
    expect(route.path).toBe('/flow')
    expect(workflow.values.value).toEqual({ name: 'from-recipe' })
  })

  it('restores the stepper frontier from recipe Context so later steps look filled', async () => {
    route.path = '/flow'
    const workflow = useWorkflow({ config: recipeConfig, registry: {} })
    await nextTick()

    expect(workflow.navigableStepIds.value).toEqual([])

    await workflow.loadFromRecipe({ name: 'from-recipe', region: 'us-west' })
    await nextTick()

    // On entry (a); frontier reaches b from produced keys → b is clickable/filled.
    expect(workflow.navigableStepIds.value).toEqual(['b'])
  })

  it('lets globals overwrite recipe keys when both set the same field', async () => {
    route.path = '/flow'
    const workflow = useWorkflow({
      config: recipeConfig,
      registry: {},
      globals: { name: 'from-globals' },
    })
    await nextTick()

    await workflow.loadFromRecipe({ name: 'from-recipe' })
    await nextTick()

    expect(workflow.context.value.name).toBe('from-globals')
    expect(workflow.values.value).toEqual({ name: 'from-globals' })
  })

  it('lets globals overwrite projectId when loading a recipe from another group', async () => {
    route.path = '/flow'
    const workflow = useWorkflow({
      config: recipeConfig,
      registry: {},
      globals: { projectId: '12701' },
    })
    await nextTick()

    await workflow.loadFromRecipe({ projectId: '12669' })
    await nextTick()

    expect(workflow.context.value.projectId).toBe('12701')
  })

  it('does not wipe recipe projectId when globals projectId is absent', async () => {
    route.path = '/flow'
    const workflow = useWorkflow({
      config: recipeConfig,
      registry: {},
      globals: { projectId: null },
    })
    await nextTick()

    await workflow.loadFromRecipe({ projectId: '12669' })
    await nextTick()

    expect(workflow.context.value.projectId).toBe('12669')
  })

  it('does not clobber hydrated global when declared but absent from supplied globals', async () => {
    const followUpConfig: WorkflowConfig = {
      ...recipeConfig,
      context: {
        globals: ['isFollowUpDeploy'],
      },
    }
    route.path = '/flow'
    const workflow = useWorkflow({
      config: followUpConfig,
      registry: {},
      globals: {},
    })
    await nextTick()

    await workflow.loadFromRecipe({ name: 'from-recipe', isFollowUpDeploy: true })
    await nextTick()

    expect(workflow.context.value.isFollowUpDeploy).toBe(true)
    expect(workflow.context.value.name).toBe('from-recipe')
  })

  it('landOn navigates to the requested step', async () => {
    route.path = '/flow'
    const workflow = useWorkflow({ config: recipeConfig, registry: {} })
    await nextTick()

    await workflow.loadFromRecipe({ name: 'from-recipe', region: 'us-west' }, { landOn: 'b' })
    await nextTick()

    expect(navigateToMock).toHaveBeenCalledWith('/flow/b')
    expect(route.path).toBe('/flow/b')
  })

  it('throws when landOn names an unknown step', async () => {
    route.path = '/flow'
    const workflow = useWorkflow({ config: recipeConfig, registry: {} })
    await nextTick()

    await expect(workflow.loadFromRecipe({ name: 'x' }, { landOn: 'missing' }))
      .rejects
      .toThrow(/unknown step "missing"/)
  })

  it('raises maxVisitedIndex to cover the landed step', async () => {
    route.path = '/flow'
    const workflow = useWorkflow({ config: recipeConfig, registry: {} })
    await nextTick()

    await workflow.loadFromRecipe({ name: 'from-recipe' }, { landOn: 'c' })
    await nextTick()

    expect(workflow.maxVisitedIndex.value).toBe(2)
  })

  it('re-enters the landed step when already on its route', async () => {
    route.path = '/flow/b'
    const workflow = useWorkflow({ config: recipeConfig, registry: {} })
    await nextTick()

    await workflow.loadFromRecipe({ name: 'from-recipe', region: 'us-west' }, { landOn: 'b' })
    await nextTick()

    expect(navigateToMock).not.toHaveBeenCalled()
    expect(workflow.values.value).toEqual({ region: 'us-west' })
  })

  it('does not bypass requires on the landed step', async () => {
    const requiresConfig: WorkflowConfig = {
      ...recipeConfig,
      steps: [
        recipeConfig.steps[0]!,
        {
          ...recipeConfig.steps[1]!,
          requires: ['name'],
        },
        {
          ...recipeConfig.steps[2]!,
          requires: ['region'],
        },
      ],
    }
    route.path = '/flow'
    const workflow = useWorkflow({ config: requiresConfig, registry: {} })
    await nextTick()

    await workflow.loadFromRecipe({ name: 'from-recipe' }, { landOn: 'c' })
    await nextTick()

    expect(route.path).toBe('/flow/b')
  })

  it('snapshot kind keeps excluded template handles in context', async () => {
    const deployLikeConfig: WorkflowConfig = {
      workflow: 'deploy',
      version: 1,
      entry: 'a',
      basePath: '/deploy',
      recipes: {
        excludeKeys: ['appId', 'deploymentId'],
      },
      steps: [
        {
          id: 'a',
          title: 'A',
          interactions: { transitions: [] },
          output: {
            produces: ['appId', 'deploymentId', 'name'],
          },
        },
      ],
    }
    route.path = '/deploy'
    const workflow = useWorkflow({ config: deployLikeConfig, registry: {} })
    await nextTick()

    await workflow.loadFromRecipe({
      appId: 'app-1',
      deploymentId: 'dep-1',
      name: 'demo',
    }, { kind: 'snapshot' })
    await nextTick()

    expect(workflow.context.value).toEqual({
      appId: 'app-1',
      deploymentId: 'dep-1',
      name: 'demo',
    })
  })
})

describe('recipe context', () => {
  const guidedLikeConfig: WorkflowConfig = {
    workflow: 'default-deploy-workflow',
    version: 1,
    entry: 'workload',
    basePath: '/deploy',
    stepper: { navigable: true, order: 'array' },
    context: {
      globals: ['user', 'projectId'],
    },
    recipes: {
      excludeKeys: ['user', 'deploymentId', 'appId'],
    },
    steps: [
      {
        id: 'workload',
        title: 'Workload',
        interactions: {
          inputs: [
            { field: 'workloadType', type: 'text' },
          ],
          transitions: [
            { target: 'link-project' },
          ],
        },
        output: {
          produces: ['workloadType', 'deploymentName'],
        },
      },
      {
        id: 'link-project',
        title: 'Link to a Project',
        interactions: {
          inputs: [
            { field: 'projectId', type: 'text' },
          ],
          transitions: [],
        },
        output: {
          produces: ['projectId'],
        },
      },
    ],
  }

  it('loadFromRecipe keeps only savable workflow keys', async () => {
    route.path = '/deploy'
    const workflow = useWorkflow({ config: guidedLikeConfig, registry: {} })
    await nextTick()

    await workflow.loadFromRecipe({
      'link-project': '99999',
      'projectId': '12701',
      'user': { id: '1', name: 'Demo' },
      'deploymentId': 'dep-1',
      'workloadType': 'static-site',
      'deploymentName': 'demo',
    })
    await nextTick()

    expect(workflow.context.value).toEqual({
      projectId: '12701',
      workloadType: 'static-site',
      deploymentName: 'demo',
    })
  })

  it('snapshotContext matches sanitized live context', async () => {
    route.path = '/deploy'
    const workflow = useWorkflow({ config: guidedLikeConfig, registry: {} })
    await nextTick()

    await workflow.loadFromRecipe({
      projectId: '12701',
      workloadType: 'static-site',
      deploymentName: 'demo',
    })
    await nextTick()

    expect(workflow.snapshotContext()).toEqual({
      projectId: '12701',
      workloadType: 'static-site',
      deploymentName: 'demo',
    })
  })

  it('snapshotContext returns a clone isolated from live context', async () => {
    route.path = '/deploy'
    const workflow = useWorkflow({ config: guidedLikeConfig, registry: {} })
    await nextTick()

    await workflow.loadFromRecipe({
      projectId: '12701',
      workloadType: 'static-site',
      deploymentName: 'demo',
    })
    await nextTick()

    const snapshot = workflow.snapshotContext()
    snapshot.projectId = 'mutated'
    expect(workflow.context.value.projectId).toBe('12701')
  })
})
