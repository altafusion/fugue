import type { StepConfig, WorkflowConfig } from '../types/workflow'
import { describe, expect, it } from 'vitest'
import { safeLoadWorkflow } from './loadWorkflow'
import { resolveStepperConfig } from './stepperConfig'

function step(stepper?: StepConfig['stepper']): StepConfig {
  return {
    id: 'security',
    title: 'Classification & Sensitivity',
    stepper,
    interactions: { transitions: [] },
  }
}

function workflow(stepper?: WorkflowConfig['stepper']): Pick<WorkflowConfig, 'stepper'> {
  return { stepper }
}

describe('resolveStepperConfig', () => {
  it('falls back to the step title and everything off', () => {
    expect(resolveStepperConfig(workflow(), step())).toEqual({
      label: 'Classification & Sensitivity',
      description: undefined,
      navigable: false,
      closable: false,
    })
  })

  it('prefers the step label and description', () => {
    const resolved = resolveStepperConfig(
      workflow(),
      step({ label: 'Data & Security', description: 'Data classification' }),
    )
    expect(resolved.label).toBe('Data & Security')
    expect(resolved.description).toBe('Data classification')
  })

  it('inherits navigable and closable from the flow-wide block', () => {
    const resolved = resolveStepperConfig(
      workflow({ navigable: true, closable: true }),
      step({ label: 'Data' }),
    )
    expect(resolved).toMatchObject({ navigable: true, closable: true })
  })

  it('lets a step opt out of navigation while keeping the flow-wide close control', () => {
    const resolved = resolveStepperConfig(
      workflow({ navigable: true, closable: true }),
      step({ navigable: false }),
    )
    expect(resolved).toMatchObject({ navigable: false, closable: true })
  })

  it('lets a step opt in when the flow-wide default is off', () => {
    expect(resolveStepperConfig(workflow(), step({ navigable: true })).navigable).toBe(true)
  })
})

describe('stepper schema', () => {
  function yamlFor(stepBody: string): string {
    return `
workflow: steppers
version: 1
entry: only
basePath: /steppers
stepper:
  navigable: true
  closable: true
steps:
  - id: only
    title: Only
${stepBody}    interactions:
      transitions: [{ target: /done }]
`
  }

  it('parses a nested step stepper block', () => {
    const result = safeLoadWorkflow(yamlFor(
      '    stepper:\n      label: Only\n      description: The only step\n      navigable: false\n      closable: true\n',
    ))
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.config.steps[0]!.stepper).toEqual({
        label: 'Only',
        description: 'The only step',
        navigable: false,
        closable: true,
      })
    }
  })

  it('rejects the legacy stepperLabel and stepperDescription keys', () => {
    for (const legacy of ['    stepperLabel: Only\n', '    stepperDescription: Only\n']) {
      const result = safeLoadWorkflow(yamlFor(legacy))
      expect(result.ok).toBe(false)
    }
  })

  it('rejects unknown keys inside the step stepper block', () => {
    const result = safeLoadWorkflow(yamlFor('    stepper:\n      bogus: true\n'))
    expect(result.ok).toBe(false)
  })

  it('parses closable on the flow-wide stepper block', () => {
    const result = safeLoadWorkflow(yamlFor(''))
    expect(result.ok).toBe(true)
    if (result.ok)
      expect(result.config.stepper).toEqual({ navigable: true, closable: true })
  })
})
