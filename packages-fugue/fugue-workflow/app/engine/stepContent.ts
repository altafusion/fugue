import type { InputConfig, StepConfig } from '../types/workflow'

/**
 * Whether a step has anything the wizard UI can render (fields or actions).
 * Used to surface a warning instead of a blank card when all inputs are hidden
 * by guards and there are no actions.
 */
export function stepHasRenderableContent(
  step: StepConfig,
  visibleInputs: InputConfig[],
): boolean {
  if (visibleInputs.length > 0)
    return true
  if ((step.interactions.actions?.length ?? 0) > 0)
    return true
  // An authored footer note renders in the step body, so it is real content.
  if (step.footer?.note)
    return true
  return false
}

/**
 * Whether the wizard should warn that a step has nothing to render.
 *
 * Distinguishes a genuine dead end from an intentional terminal screen: a step that
 * declares no inputs and no actions AND has no transitions is a confirmation step
 * (its title and stepper description carry the message), not a misconfiguration.
 * A step that DECLARED inputs or actions but shows none is still a real problem —
 * usually a `when` guard hiding everything — and still warns.
 */
export function stepShouldWarnEmpty(
  step: StepConfig,
  visibleInputs: InputConfig[],
): boolean {
  if (stepHasRenderableContent(step, visibleInputs))
    return false

  const declaresNothing = (step.interactions.inputs?.length ?? 0) === 0
    && (step.interactions.actions?.length ?? 0) === 0
  const isTerminal = (step.interactions.transitions?.length ?? 0) === 0

  return !(declaresNothing && isTerminal)
}
