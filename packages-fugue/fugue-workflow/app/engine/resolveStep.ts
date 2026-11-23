import type { StepConfig, WorkflowConfig } from '../types/workflow'
import { deriveStepOrder, getDescendantStepIds, getStepOrderMode } from './orderSteps'

/** Find a step by id. */
export function findStepById(config: WorkflowConfig, stepId: string): StepConfig | undefined {
  return config.steps.find(step => step.id === stepId)
}

/**
 * Full route for a step: the workflow `basePath` for the entry step, else
 * `basePath` + `/` + (`slug` ?? `id`). Trailing slash on basePath is tolerated.
 */
export function stepRoute(config: WorkflowConfig, step: StepConfig): string {
  const base = config.basePath.replace(/\/$/, '')
  if (step.id === config.entry)
    return base || '/'
  const segment = (step.slug ?? step.id).replace(/^\/+/, '')
  return `${base}/${segment}`
}

/** Resolve the step for a route path; fall back to the entry step. */
export function resolveStep(config: WorkflowConfig, routePath: string): StepConfig {
  const normalized = routePath.replace(/\/$/, '') || '/'
  const matched = config.steps.find(step => stepRoute(config, step) === normalized)
  if (matched)
    return matched

  const entry = findStepById(config, config.entry)
  if (!entry)
    throw new Error(`resolveStep: entry step "${config.entry}" not found`)
  return entry
}

/**
 * Walk steps in derived display order; return the furthest step whose data requirements are met.
 * Stops at the first step with unmet requirements. Falls back to entry when none satisfy.
 */
export function nearestSatisfiableStep(
  config: WorkflowConfig,
  has: (key: string) => boolean,
  orderedSteps?: StepConfig[],
): StepConfig {
  const steps = orderedSteps ?? deriveStepOrder(config)
  let lastSatisfiable: StepConfig | undefined

  for (const step of steps) {
    const requires = step.requires ?? []
    if (!requires.every(key => has(key)))
      break
    lastSatisfiable = step
  }

  if (lastSatisfiable)
    return lastSatisfiable

  const entry = findStepById(config, config.entry)
  if (!entry)
    throw new Error(`nearestSatisfiableStep: entry step "${config.entry}" not found`)
  return entry
}

/**
 * Context keys produced by downstream steps relative to the given step.
 * Array mode: steps after the current index in `config.steps`.
 * Transition mode: descendants in the static transition graph.
 */
export function downstreamProducedKeys(config: WorkflowConfig, stepId: string): string[] {
  const mode = getStepOrderMode(config)
  const descendants = getDescendantStepIds(config, stepId, mode)
  if (descendants.size === 0)
    return []

  const ordered = deriveStepOrder(config, mode)
  const keys = new Set<string>()

  for (const step of ordered) {
    if (!descendants.has(step.id))
      continue
    for (const key of step.output?.produces ?? [])
      keys.add(key)
  }

  return [...keys]
}

/** Whether a transition target refers to a known step id (vs a relative app path). */
export function isStepId(config: WorkflowConfig, target: string): boolean {
  return config.steps.some(step => step.id === target)
}

/**
 * Resolve a transition target to a route: a known step id → its route, otherwise the
 * target is treated as an already-resolved **relative** app path (e.g. a post-deploy
 * detail route). Transition targets are intentionally relative-only — no absolute
 * external URLs (see docs "Decided") — so callers can `navigateTo(result)` without the
 * Nuxt `{ external: true }` flag.
 */
export function resolveNavigationTarget(config: WorkflowConfig, target: string): string {
  const step = findStepById(config, target)
  if (step)
    return stepRoute(config, step)
  return target
}
