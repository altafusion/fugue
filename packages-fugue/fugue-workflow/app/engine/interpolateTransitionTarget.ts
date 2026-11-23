import type { WorkflowContext } from '../types/workflow'

const PARAM_PATTERN = /\{([^}]+)\}/g

/** Replace `{key}` tokens in a transition target with encoded context values. */
export function interpolateTransitionTarget(target: string, ctx: WorkflowContext): string {
  return target.replace(PARAM_PATTERN, (_match, key: string) => {
    const value = ctx[key]
    if (value == null || value === '') {
      throw new Error(
        `interpolateTransitionTarget: missing context value for "${key}" in target "${target}"`,
      )
    }
    return encodeURIComponent(String(value))
  })
}
