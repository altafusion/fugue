import type { HandlerRegistry, WorkflowConfig } from '../types/workflow'

/** A workflow: a parsed config paired with its handler registry. */
export interface WorkflowEntry {
  config: WorkflowConfig
  registry: HandlerRegistry
}

export type WorkflowCatalog = Record<string, WorkflowEntry>

export interface WorkflowLoadFailure {
  basePath: string
  error: string
  workflow?: string
}

export interface ResolveWorkflowSuccess {
  status: 'ok'
  config: WorkflowConfig
  registry: HandlerRegistry
}

export interface ResolveWorkflowError {
  status: 'error'
  error: string
  basePath: string
}

export type ResolveWorkflowResult = ResolveWorkflowSuccess | ResolveWorkflowError

function normalizePath(path: string): string {
  return path.replace(/\/+$/, '') || '/'
}

/** Whether `target` equals `base` or is a segment-aligned child path under `base`. */
function matchesBasePath(target: string, base: string): boolean {
  const normalizedTarget = normalizePath(target)
  const normalizedBase = normalizePath(base)
  const prefix = normalizedBase === '/'
    ? '/'
    : `${normalizedBase}/`
  return normalizedTarget === normalizedBase || normalizedTarget.startsWith(prefix)
}

/**
 * Resolve which workflow owns a route path by longest segment-aligned `basePath`
 * prefix across successful catalog entries and load failures.
 *
 * When a failure and a catalog entry share the same matching basePath length,
 * **the failure wins** (`bestFailureLength >= bestEntryLength`). Optional
 * `fallback` applies only when nothing in the catalog or failures matches.
 */
export function resolveWorkflowFromSources(
  path: string,
  catalog: WorkflowCatalog,
  failures: WorkflowLoadFailure[],
  fallback?: WorkflowEntry,
): ResolveWorkflowResult {
  const target = normalizePath(path)
  let bestFailure: WorkflowLoadFailure | undefined
  let bestFailureLength = -1
  let bestEntry: WorkflowEntry | undefined
  let bestEntryLength = -1

  for (const failure of failures) {
    const base = normalizePath(failure.basePath)
    if (matchesBasePath(target, base) && base.length > bestFailureLength) {
      bestFailure = failure
      bestFailureLength = base.length
    }
  }

  for (const entry of Object.values(catalog)) {
    const base = normalizePath(entry.config.basePath)
    if (matchesBasePath(target, base) && base.length > bestEntryLength) {
      bestEntry = entry
      bestEntryLength = base.length
    }
  }

  if (bestFailure && bestFailureLength >= bestEntryLength) {
    return {
      status: 'error',
      error: bestFailure.error,
      basePath: bestFailure.basePath,
    }
  }

  if (bestEntry) {
    return {
      status: 'ok',
      config: bestEntry.config,
      registry: bestEntry.registry,
    }
  }

  if (fallback) {
    return {
      status: 'ok',
      config: fallback.config,
      registry: fallback.registry,
    }
  }

  return {
    status: 'error',
    error: 'No workflow matches this route.',
    basePath: target,
  }
}

/** Stable remount key from a resolved workflow result (success or failure owner). */
export function resolveWorkflowKeyFromResult(result: ResolveWorkflowResult): string {
  if (result.status === 'error')
    return result.basePath

  return result.config.basePath
}

/**
 * True when `path` is under `basePath` AND the resolver assigns that `basePath`
 * (not a longer sibling workflow, not fallback-only ownership).
 */
export function isPathOwnedByWorkflow(
  path: string,
  basePath: string,
  catalog: WorkflowCatalog,
  failures: WorkflowLoadFailure[],
  fallback?: WorkflowEntry,
): boolean {
  const target = normalizePath(path)
  const base = normalizePath(basePath)
  if (!matchesBasePath(target, base))
    return false
  const result = resolveWorkflowFromSources(path, catalog, failures, fallback)
  return normalizePath(resolveWorkflowKeyFromResult(result)) === base
}

/**
 * Resolve which workflow owns a route path by longest segment-aligned `basePath`
 * prefix among successful catalog entries only.
 */
export function resolveWorkflowEntry(
  catalog: WorkflowCatalog,
  path: string,
): WorkflowEntry | undefined {
  const result = resolveWorkflowFromSources(path, catalog, [])
  if (result.status !== 'ok')
    return undefined

  return {
    config: result.config,
    registry: result.registry,
  }
}

/**
 * Stable remount key for a route: the owning workflow's `basePath`. Crossing
 * between workflows changes the key so the page remounts with fresh engine state;
 * navigating between steps of the same workflow keeps it.
 */
export function resolveWorkflowKey(catalog: WorkflowCatalog, path: string): string {
  return resolveWorkflowEntry(catalog, path)?.config.basePath ?? '/'
}
