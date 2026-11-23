import type { InputConfig, WorkflowContext } from '../types/workflow'
import { isPresent } from '../engine/recipeContext'
import { resolveInputLabel } from './formatFieldLabel'

/** Merge async validator errors with required-field feedback after a failed Continue. */
export function resolveFieldDisplayError(
  input: InputConfig,
  values: WorkflowContext,
  fieldErrors: Record<string, string | undefined>,
  showValidation: boolean,
): string | undefined {
  const validatorError = fieldErrors[input.field]
  if (validatorError)
    return validatorError

  if (!showValidation || !input.required)
    return undefined

  const value = values[input.field]
  if (!isPresent(value))
    return `${resolveInputLabel(input.field, input.label)} is required`

  return undefined
}

export function resolveDisplayFieldErrors(
  inputs: InputConfig[],
  values: WorkflowContext,
  fieldErrors: Record<string, string | undefined>,
  showValidation: boolean,
): Record<string, string | undefined> {
  const errors: Record<string, string | undefined> = {}
  for (const input of inputs)
    errors[input.field] = resolveFieldDisplayError(input, values, fieldErrors, showValidation)
  return errors
}
