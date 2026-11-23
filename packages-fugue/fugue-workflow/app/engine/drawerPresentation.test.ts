import type { StepConfig, WorkflowConfig } from '../types/workflow'
import { describe, expect, it } from 'vitest'
import { DEFAULT_DRAWER_SIDE, resolveDrawerConfig } from './drawerPresentation'
import { safeLoadWorkflow } from './loadWorkflow'

function step(drawer?: StepConfig['drawer']): StepConfig {
  return {
    id: 'source',
    title: 'Source',
    presentation: 'drawer',
    drawer,
    interactions: { transitions: [] },
  }
}

function workflow(drawer?: WorkflowConfig['drawer']): Pick<WorkflowConfig, 'drawer'> {
  return { drawer }
}

describe('resolveDrawerConfig', () => {
  it('falls back to the engine default when nothing is configured', () => {
    expect(resolveDrawerConfig(workflow(), step())).toEqual({
      side: DEFAULT_DRAWER_SIDE,
      relocatable: false,
    })
  })

  it('inherits the flow-wide drawer block', () => {
    expect(resolveDrawerConfig(workflow({ side: 'bottom', relocatable: true }), step())).toEqual({
      side: 'bottom',
      relocatable: true,
    })
  })

  it('lets a step override the side while inheriting relocatable', () => {
    const resolved = resolveDrawerConfig(
      workflow({ side: 'right', relocatable: true }),
      step({ side: 'left' }),
    )
    expect(resolved).toEqual({ side: 'left', relocatable: true })
  })

  it('lets a step opt out of relocation', () => {
    const resolved = resolveDrawerConfig(
      workflow({ relocatable: true }),
      step({ relocatable: false }),
    )
    expect(resolved.relocatable).toBe(false)
  })

  it('defaults when there is no current step', () => {
    expect(resolveDrawerConfig(workflow({ side: 'left' })).side).toBe('left')
  })
})

describe('drawer schema', () => {
  function yamlFor(stepBody: string, workflowBody = ''): string {
    return `
workflow: drawers
version: 1
entry: only
basePath: /drawers
${workflowBody}steps:
  - id: only
    title: Only
${stepBody}    interactions:
      transitions: [{ target: /done }]
`
  }

  it('accepts a workflow-level drawer block and a per-step override', () => {
    const result = safeLoadWorkflow(yamlFor(
      '    presentation: drawer\n    drawer:\n      side: bottom\n',
      'drawer:\n  side: left\n  relocatable: true\n',
    ))
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.config.drawer).toEqual({ side: 'left', relocatable: true })
      expect(result.config.steps[0]!.drawer).toEqual({ side: 'bottom' })
    }
  })

  it('rejects an unsupported side', () => {
    const result = safeLoadWorkflow(yamlFor('    presentation: drawer\n    drawer:\n      side: top\n'))
    expect(result.ok).toBe(false)
  })

  it('rejects a drawer block on a non-drawer step', () => {
    const result = safeLoadWorkflow(yamlFor('    drawer:\n      side: bottom\n'))
    expect(result.ok).toBe(false)
    if (!result.ok)
      expect(result.error).toMatch(/presentation: drawer/)
  })
})
