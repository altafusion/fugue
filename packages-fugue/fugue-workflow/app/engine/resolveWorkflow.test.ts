import type { WorkflowCatalog, WorkflowLoadFailure } from './resolveWorkflow'
import { describe, expect, it } from 'vitest'
import {
  isPathOwnedByWorkflow,
  resolveWorkflowEntry,
  resolveWorkflowFromSources,
  resolveWorkflowKey,
  resolveWorkflowKeyFromResult,
} from './resolveWorkflow'

const catalog = {
  defaultDeployWorkflow: {
    config: {
      workflow: 'default-deploy-workflow',
      version: 1,
      entry: 'a',
      basePath: '/deploy',
      steps: [],
    },
    registry: {},
  },
  demoWorkflow: {
    config: {
      workflow: 'demo-workflow',
      version: 1,
      entry: 'a',
      basePath: '/deploy/demo-workflow',
      steps: [],
    },
    registry: {},
  },
  sample: {
    config: {
      workflow: 'sample',
      version: 1,
      entry: 'x',
      basePath: '/deploy/sample',
      steps: [],
    },
    registry: {},
  },
} satisfies WorkflowCatalog

const validCatalog = {
  defaultDeployWorkflow: {
    config: {
      workflow: 'default-deploy-workflow',
      version: 1,
      entry: 'a',
      basePath: '/deploy',
      steps: [
        {
          id: 'a',
          title: 'A',
          interactions: {
            transitions: [
              { target: '/done' },
            ],
          },
        },
      ],
    },
    registry: {},
  },
  sample: {
    config: {
      workflow: 'sample',
      version: 1,
      entry: 'x',
      basePath: '/deploy/sample',
      steps: [
        {
          id: 'x',
          title: 'X',
          interactions: {
            transitions: [
              { target: '/done' },
            ],
          },
        },
      ],
    },
    registry: {},
  },
} satisfies WorkflowCatalog

const fallback = validCatalog.defaultDeployWorkflow

describe('resolveWorkflowEntry', () => {
  it('matches the default deploy workflow at its bare basePath', () => {
    expect(resolveWorkflowEntry(catalog, '/deploy')?.config.workflow).toBe('default-deploy-workflow')
    expect(resolveWorkflowEntry(catalog, '/deploy/source')?.config.workflow).toBe('default-deploy-workflow')
  })

  it('prefers the longest matching basePath for nested workflows', () => {
    expect(resolveWorkflowEntry(catalog, '/deploy/demo-workflow')?.config.workflow).toBe('demo-workflow')
    expect(resolveWorkflowEntry(catalog, '/deploy/demo-workflow/workload')?.config.workflow).toBe('demo-workflow')
    expect(resolveWorkflowEntry(catalog, '/deploy/sample')?.config.workflow).toBe('sample')
    expect(resolveWorkflowEntry(catalog, '/deploy/sample/review')?.config.workflow).toBe('sample')
  })

  it('is segment-aware (does not match partial segments)', () => {
    expect(resolveWorkflowEntry(catalog, '/deploy/samplexyz')?.config.workflow).toBe('default-deploy-workflow')
    expect(resolveWorkflowEntry(catalog, '/deploy/demo-workflowxyz')?.config.workflow).toBe('default-deploy-workflow')
  })

  it('returns undefined for unrelated paths', () => {
    expect(resolveWorkflowEntry(catalog, '/deploy-catalog')).toBeUndefined()
    expect(resolveWorkflowEntry(catalog, '/other')).toBeUndefined()
  })

  it('matches child routes when basePath is root', () => {
    const rootCatalog = {
      root: {
        config: {
          workflow: 'root',
          version: 1,
          entry: 'a',
          basePath: '/',
          steps: [],
        },
        registry: {},
      },
    } satisfies WorkflowCatalog

    expect(resolveWorkflowEntry(rootCatalog, '/')).toBeDefined()
    expect(resolveWorkflowEntry(rootCatalog, '/step-1')?.config.workflow).toBe('root')
  })
})

describe('resolveWorkflowKey', () => {
  it('returns the owning workflow basePath as a stable remount key', () => {
    expect(resolveWorkflowKey(catalog, '/deploy/source')).toBe('/deploy')
    expect(resolveWorkflowKey(catalog, '/deploy/demo-workflow/workload')).toBe('/deploy/demo-workflow')
    expect(resolveWorkflowKey(catalog, '/deploy/sample/review')).toBe('/deploy/sample')
  })

  it('returns / when no catalog entry matches', () => {
    expect(resolveWorkflowKey(catalog, '/other')).toBe('/')
  })
})

describe('resolveWorkflowFromSources', () => {
  it('resolves a valid workflow by longest basePath prefix', () => {
    expect(resolveWorkflowFromSources('/deploy/sample/review', validCatalog, [], fallback).status).toBe('ok')
    expect(
      resolveWorkflowFromSources('/deploy/sample/review', validCatalog, [], fallback),
    ).toMatchObject({ status: 'ok', config: validCatalog.sample.config })
  })

  it('resolves a deliberately broken workflow to error for paths under its basePath', () => {
    const failures: WorkflowLoadFailure[] = [
      {
        basePath: '/deploy/broken',
        error: 'loadWorkflow: invalid workflow shape — steps.0.interactions.inputs.0.type: Invalid enum value',
      },
    ]

    const result = resolveWorkflowFromSources('/deploy/broken/step', validCatalog, failures, fallback)
    expect(result).toEqual({
      status: 'error',
      basePath: '/deploy/broken',
      error: failures[0]!.error,
    })
  })

  it('prefers the longest matching basePath between valid and failed entries', () => {
    const failures: WorkflowLoadFailure[] = [
      {
        basePath: '/deploy/sample',
        error: 'loadWorkflow: missing loader handler "missing"',
      },
    ]

    const underSample = resolveWorkflowFromSources('/deploy/sample/review', validCatalog, failures, fallback)
    expect(underSample.status).toBe('error')
    if (underSample.status === 'error')
      expect(underSample.basePath).toBe('/deploy/sample')

    const underGuided = resolveWorkflowFromSources('/deploy/source', validCatalog, failures, fallback)
    expect(underGuided.status).toBe('ok')
  })

  it('failures win equal-length ties with catalog entries at the same basePath', () => {
    const failures: WorkflowLoadFailure[] = [
      {
        basePath: '/deploy',
        error: 'load failure at deploy root',
      },
    ]

    const result = resolveWorkflowFromSources('/deploy/source', validCatalog, failures, fallback)
    expect(result.status).toBe('error')
    if (result.status === 'error') {
      expect(result.basePath).toBe('/deploy')
      expect(result.error).toBe('load failure at deploy root')
    }
  })

  it('falls back to the fallback entry when nothing matches', () => {
    expect(
      resolveWorkflowFromSources('/other', validCatalog, [], fallback),
    ).toMatchObject({ status: 'ok', config: fallback.config })
  })

  it('returns domain-free no-match error without fallback', () => {
    expect(
      resolveWorkflowFromSources('/other', validCatalog, [], undefined),
    ).toMatchObject({
      status: 'error',
      error: 'No workflow matches this route.',
    })
  })
})

describe('resolveWorkflowKeyFromResult', () => {
  it('uses config basePath on success', () => {
    const result = resolveWorkflowFromSources('/deploy/sample', validCatalog, [], fallback)
    expect(result.status).toBe('ok')
    if (result.status === 'ok')
      expect(resolveWorkflowKeyFromResult(result)).toBe('/deploy/sample')
  })

  it('uses failure basePath on error', () => {
    const failures: WorkflowLoadFailure[] = [
      { basePath: '/deploy/broken', error: 'broken' },
    ]
    const result = resolveWorkflowFromSources('/deploy/broken/x', validCatalog, failures, fallback)
    expect(resolveWorkflowKeyFromResult(result)).toBe('/deploy/broken')
  })
})

describe('isPathOwnedByWorkflow', () => {
  it('returns true for paths owned by the workflow basePath', () => {
    expect(isPathOwnedByWorkflow('/deploy/security', '/deploy', validCatalog, [], fallback)).toBe(true)
    expect(isPathOwnedByWorkflow('/deploy', '/deploy', validCatalog, [], fallback)).toBe(true)
  })

  it('returns false when prefix matches but resolver assigns a different workflow', () => {
    expect(isPathOwnedByWorkflow('/deploy/sample', '/deploy', validCatalog, [], fallback)).toBe(false)
  })

  it('returns false for fallback-only paths that share no real owner', () => {
    expect(isPathOwnedByWorkflow('/', '/deploy', validCatalog, [], fallback)).toBe(false)
  })

  it('returns true for nested paths under a longer workflow basePath', () => {
    expect(isPathOwnedByWorkflow('/deploy/sample/review', '/deploy/sample', validCatalog, [], fallback)).toBe(true)
  })

  it('normalizes trailing slashes on the workflow basePath', () => {
    expect(isPathOwnedByWorkflow('/deploy/security', '/deploy/', validCatalog, [], fallback)).toBe(true)
  })
})
