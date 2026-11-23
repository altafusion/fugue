import type { StepConfig, WorkflowConfig } from '../types/workflow'

export interface ResolvedStepperConfig {
  /** Bullet label, falling back to the step title. */
  label: string
  description?: string
  navigable: boolean
  closable: boolean
}

/**
 * Precedence: step `stepper` → workflow `stepper` → engine default (off). Each key
 * resolves independently, so a step can opt out of navigation while inheriting the
 * flow-wide close affordance.
 */
export function resolveStepperConfig(
  config: Pick<WorkflowConfig, 'stepper'>,
  step: StepConfig,
): ResolvedStepperConfig {
  return {
    label: step.stepper?.label ?? step.title,
    description: step.stepper?.description,
    navigable: step.stepper?.navigable ?? config.stepper?.navigable ?? false,
    closable: step.stepper?.closable ?? config.stepper?.closable ?? false,
  }
}
