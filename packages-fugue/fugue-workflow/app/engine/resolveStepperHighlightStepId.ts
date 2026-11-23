import type { StepConfig, WorkflowConfig } from '../types/workflow'
import { deriveStepOrder } from './orderSteps'
import { findStepById } from './resolveStep'

function isOverlayStep(step: StepConfig): boolean {
  const presentation = step.presentation ?? 'inline'
  return presentation === 'drawer' || presentation === 'modal'
}

/**
 * Map a workflow step id to the stepper bullet that should reflect its state.
 * Overlay steps (drawer/modal) roll up to the nearest preceding inline step.
 */
export function resolveStepperHighlightStepId(
  config: WorkflowConfig,
  stepId: string,
): string {
  const step = findStepById(config, stepId)
  if (!step)
    return stepId
  if (!isOverlayStep(step))
    return step.id

  const orderedSteps = deriveStepOrder(config)
  const index = orderedSteps.findIndex(item => item.id === step.id)
  for (let i = index - 1; i >= 0; i--) {
    const prev = orderedSteps[i]!
    if (!isOverlayStep(prev))
      return prev.id
  }
  return step.id
}
