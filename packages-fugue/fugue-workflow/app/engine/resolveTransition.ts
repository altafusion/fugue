import type { HandlerRegistry, StepConfig, WorkflowContext } from '../types/workflow'
import { evaluateWhen } from './evaluateGuard'
import { interpolateTransitionTarget } from './interpolateTransitionTarget'

/**
 * Evaluate transitions in order; return the first satisfied target (step id or external path).
 * A transition matches when its optional `on` equals the fired event and its guard passes.
 */
export function resolveTransition(
  step: StepConfig,
  ctx: WorkflowContext,
  event: string | undefined,
  registry: HandlerRegistry,
): string | undefined {
  for (const transition of step.interactions?.transitions ?? []) {
    if (transition.on !== event)
      continue

    if (transition.when && !evaluateWhen(transition.when, ctx, registry))
      continue

    if (transition.dynamic) {
      const fn = registry.transitions?.[transition.dynamic]
      if (!fn) {
        throw new Error(
          `resolveTransition: step "${step.id}" matched a dynamic transition but no transition handler "${transition.dynamic}" is registered`,
        )
      }
      return fn(ctx)
    }

    if (transition.target)
      return interpolateTransitionTarget(transition.target, ctx)
  }

  return undefined
}
