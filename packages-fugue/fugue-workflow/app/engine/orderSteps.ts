import type { StepConfig, WorkflowConfig } from '../types/workflow'

export type StepOrderMode = 'transition' | 'array'

export function getStepOrderMode(config: WorkflowConfig): StepOrderMode {
  return config.stepper?.order ?? 'transition'
}

/** Static transition targets that resolve to known step ids (declaration order, deduped). */
export function buildSuccessorsMap(config: WorkflowConfig): Map<string, string[]> {
  const map = new Map<string, string[]>()
  for (const step of config.steps)
    map.set(step.id, [])

  for (const step of config.steps) {
    const successors: string[] = []
    for (const transition of step.interactions?.transitions ?? []) {
      if (transition.dynamic)
        continue
      const target = transition.target
      if (!target || target.startsWith('/') || !map.has(target))
        continue
      if (!successors.includes(target))
        successors.push(target)
    }
    map.set(step.id, successors)
  }

  return map
}

function buildPredecessorsMap(successorsMap: Map<string, string[]>): Map<string, string[]> {
  const predecessors = new Map<string, string[]>()
  for (const stepId of successorsMap.keys())
    predecessors.set(stepId, [])

  for (const [from, targets] of successorsMap) {
    for (const to of targets) {
      const preds = predecessors.get(to)
      if (preds && !preds.includes(from))
        preds.push(from)
    }
  }

  return predecessors
}

/** Step ids reachable from entry via static transition edges. */
export function reachableStepIds(config: WorkflowConfig): Set<string> {
  const successorsMap = buildSuccessorsMap(config)
  const reachable = new Set<string>()

  function visit(stepId: string) {
    if (reachable.has(stepId))
      return
    reachable.add(stepId)
    for (const succ of successorsMap.get(stepId) ?? [])
      visit(succ)
  }

  visit(config.entry)
  return reachable
}

/** onError step-id targets per step (declaration order, deduped; excludes 'stay' and external routes). */
export function buildErrorSuccessorsMap(config: WorkflowConfig): Map<string, string[]> {
  const known = new Set(config.steps.map(step => step.id))
  const map = new Map<string, string[]>()

  for (const step of config.steps) {
    const targets: string[] = []
    for (const action of step.interactions?.actions ?? []) {
      const onError = action.onError
      if (!onError || onError === 'stay' || onError.startsWith('/') || !known.has(onError))
        continue
      if (!targets.includes(onError))
        targets.push(onError)
    }
    map.set(step.id, targets)
  }

  return map
}

/**
 * Reachability including onError recovery edges — a superset of `reachableStepIds`.
 * Used for orphan detection so a step reached only via error recovery is not flagged
 * unreachable. onError edges are intentionally NOT part of `deriveStepOrder` (they are
 * exceptional paths, not happy-path order) nor of key-availability computation.
 */
export function reachableStepIdsIncludingErrors(config: WorkflowConfig): Set<string> {
  const successorsMap = buildSuccessorsMap(config)
  const errorMap = buildErrorSuccessorsMap(config)
  const reachable = new Set<string>()

  function visit(stepId: string) {
    if (reachable.has(stepId))
      return
    reachable.add(stepId)
    for (const succ of successorsMap.get(stepId) ?? [])
      visit(succ)
    for (const succ of errorMap.get(stepId) ?? [])
      visit(succ)
  }

  visit(config.entry)
  return reachable
}

/** Step immediately after `stepId` in derived order, or undefined if last / not found. */
export function nextStepInOrder(
  config: WorkflowConfig,
  stepId: string,
  mode?: StepOrderMode,
): StepConfig | undefined {
  const ordered = deriveStepOrder(config, mode)
  const index = ordered.findIndex(step => step.id === stepId)
  if (index < 0 || index >= ordered.length - 1)
    return undefined
  return ordered[index + 1]
}

export function deriveStepOrder(config: WorkflowConfig, mode?: StepOrderMode): StepConfig[] {
  const orderMode = mode ?? getStepOrderMode(config)
  if (orderMode === 'array')
    return config.steps

  const stepMap = new Map(config.steps.map(s => [s.id, s]))
  const successorsMap = buildSuccessorsMap(config)
  const visited = new Set<string>()
  const postOrder: StepConfig[] = []

  // Reverse-postorder DFS = topological order for a DAG: every step precedes all
  // of its successors, so join steps always land after all their predecessors.
  // Visiting successors in reverse declaration order means the final reversal
  // restores declaration order among independent sibling branches.
  function dfs(stepId: string) {
    if (visited.has(stepId))
      return
    visited.add(stepId)

    const successors = successorsMap.get(stepId) ?? []
    for (let i = successors.length - 1; i >= 0; i--)
      dfs(successors[i]!)

    const step = stepMap.get(stepId)
    if (step)
      postOrder.push(step)
  }

  dfs(config.entry)

  const ordered = postOrder.reverse()

  // Orphans (unreachable from entry) keep original declaration order at the end.
  for (const step of config.steps) {
    if (!visited.has(step.id))
      ordered.push(step)
  }

  return ordered
}

/** Descendant step ids via the static successors graph (excludes the given step). */
export function getDescendantStepIds(
  config: WorkflowConfig,
  stepId: string,
  mode?: StepOrderMode,
): Set<string> {
  const orderMode = mode ?? getStepOrderMode(config)

  if (orderMode === 'array') {
    const idx = config.steps.findIndex(step => step.id === stepId)
    if (idx < 0)
      return new Set()
    return new Set(config.steps.slice(idx + 1).map(step => step.id))
  }

  const successorsMap = buildSuccessorsMap(config)
  const descendants = new Set<string>()

  function visit(id: string) {
    for (const succ of successorsMap.get(id) ?? []) {
      if (!descendants.has(succ)) {
        descendants.add(succ)
        visit(succ)
      }
    }
  }

  visit(stepId)
  return descendants
}

export type GuaranteedKeysMap = Map<string, Set<string>>

/**
 * For transition mode: keys guaranteed available on entry to each reachable step
 * (intersection over all paths from entry). Entry step is seeded with globals.
 */
export function computeGuaranteedAvailableKeys(config: WorkflowConfig): GuaranteedKeysMap {
  const stepMap = new Map(config.steps.map(s => [s.id, s]))
  const globals = new Set(config.context?.globals ?? [])
  const successorsMap = buildSuccessorsMap(config)
  const predecessorsMap = buildPredecessorsMap(successorsMap)
  const reachable = reachableStepIds(config)

  const allKeys = new Set<string>(globals)
  for (const step of config.steps) {
    for (const key of step.output?.produces ?? [])
      allKeys.add(key)
  }

  const guaranteed = new Map<string, Set<string>>()
  for (const stepId of reachable) {
    guaranteed.set(stepId, stepId === config.entry
      ? new Set(globals)
      : new Set(allKeys))
  }

  let changed = true
  while (changed) {
    changed = false
    for (const stepId of reachable) {
      if (stepId === config.entry)
        continue

      const preds = predecessorsMap.get(stepId) ?? []
      let intersection: Set<string> | undefined

      for (const predId of preds) {
        const predGuaranteed = guaranteed.get(predId)
        if (!predGuaranteed)
          continue
        const predStep = stepMap.get(predId)
        const predAvailable = new Set(predGuaranteed)
        for (const key of predStep?.output?.produces ?? [])
          predAvailable.add(key)

        if (!intersection) {
          // Reuse the first predecessor's fresh set as the accumulator.
          intersection = predAvailable
        } else {
          // Monotonic narrowing: drop keys not present on this path.
          for (const key of intersection) {
            if (!predAvailable.has(key))
              intersection.delete(key)
          }
        }
      }

      if (!intersection)
        continue

      const current = guaranteed.get(stepId)!
      // Sets only shrink from `allKeys`, so `intersection` is always a subset of
      // `current`; a size change is sufficient to detect any difference.
      if (intersection.size !== current.size) {
        guaranteed.set(stepId, intersection)
        changed = true
      }
    }
  }

  return guaranteed
}
