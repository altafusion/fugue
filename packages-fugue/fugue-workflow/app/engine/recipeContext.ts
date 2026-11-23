import type { RecipeContextKind, WorkflowConfig, WorkflowContext } from '../types/workflow'

export type { RecipeContextKind } from '../types/workflow'

function isPlainObject(value: object): boolean {
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

export function isPresent(value: unknown): boolean {
  if (value === null || value === undefined || value === '')
    return false
  if (Array.isArray(value))
    return value.length > 0
  if (typeof value === 'object') {
    if (!isPlainObject(value))
      return true
    return Object.keys(value).length > 0
  }
  return true
}

/** Context keys the workflow declares (globals, step inputs, and step `produces`). */
export function collectRecipeContextKeys(config: WorkflowConfig): Set<string> {
  const keys = new Set<string>(config.context?.globals ?? [])
  for (const step of config.steps) {
    for (const input of step.interactions?.inputs ?? []) {
      if (input.field)
        keys.add(input.field)
    }
    for (const key of step.output?.produces ?? [])
      keys.add(key)
  }
  return keys
}

function recipeExcludeKeys(config: WorkflowConfig, kind: RecipeContextKind): Set<string> {
  if (kind === 'snapshot') {
    // Absent snapshotExcludeKeys excludes nothing — do not fall back to excludeKeys.
    return new Set(config.recipes?.snapshotExcludeKeys ?? [])
  }
  return new Set(config.recipes?.excludeKeys ?? [])
}

/**
 * Recipe-safe Context: only workflow-known keys, minus configured exclusions.
 * Returns a JSON deep clone safe for callers to mutate without affecting live Context.
 * @throws when a value cannot be serialized for localStorage.
 */
export function sanitizeRecipeContext(
  config: WorkflowConfig,
  context: WorkflowContext,
  kind: RecipeContextKind = 'template',
): WorkflowContext {
  const allowed = collectRecipeContextKeys(config)
  const exclude = recipeExcludeKeys(config, kind)
  const sanitized: WorkflowContext = {}

  for (const [key, value] of Object.entries(context)) {
    if (exclude.has(key) || !allowed.has(key) || !isPresent(value))
      continue
    sanitized[key] = value
  }

  return cloneSerializableContext(sanitized)
}

export function cloneSerializableContext(context: WorkflowContext): WorkflowContext {
  try {
    return JSON.parse(JSON.stringify(context)) as WorkflowContext
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : String(error)
    throw new Error(`Recipe context contains values that cannot be saved: ${message}`)
  }
}
