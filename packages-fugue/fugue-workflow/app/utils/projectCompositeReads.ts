import type { InputConfig, WorkflowContext } from '../types/workflow'

/**
 * A composite's Input Contract: resolve its `reads` map (`componentKey: contextKey`)
 * against Context. Returns undefined when the input declares nothing, so the
 * component's prop stays absent rather than an empty object.
 */
export function projectCompositeReads(
  input: InputConfig,
  context: WorkflowContext,
): WorkflowContext | undefined {
  const reads = input.reads
  if (!reads || Object.keys(reads).length === 0)
    return undefined

  return Object.fromEntries(
    Object.entries(reads).map(([componentKey, contextKey]) => [componentKey, context[contextKey]]),
  )
}
