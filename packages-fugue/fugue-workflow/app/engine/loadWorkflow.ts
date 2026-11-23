import type { HandlerRegistry, StepConfig, WorkflowConfig } from '../types/workflow'
import { load as parseYaml } from 'js-yaml'
import { toErrorMessage } from './errorMessage'
import { buildErrorSuccessorsMap, buildSuccessorsMap, computeGuaranteedAvailableKeys, getStepOrderMode, reachableStepIdsIncludingErrors } from './orderSteps'
import { isStepId, stepRoute } from './resolveStep'
import { workflowConfigSchema } from './workflowSchema'

const GUARD_HANDLER_PATTERN = /^[A-Z_]\w*$/i
// Bare DSL keyword literals — they match the identifier pattern but are inline
// expressions (e.g. `when: "false"`), not handler ids.
const DSL_KEYWORDS = new Set(['true', 'false', 'null'])

/**
 * A bare identifier (e.g. `isReady`) is a guard-handler reference; anything with
 * operators, quotes or whitespace is an inline DSL expression. The anchored
 * identifier pattern already excludes every DSL character, so matching it —
 * minus the reserved keyword literals — is sufficient to tell the two apart.
 */
function isGuardHandlerReference(when: string): boolean {
  return GUARD_HANDLER_PATTERN.test(when) && !DSL_KEYWORDS.has(when)
}

/** What each registry bucket holds, for error copy — components are not handlers. */
const REGISTRY_NOUNS: Record<keyof HandlerRegistry, string> = {
  loaders: 'loader handler',
  validators: 'validator handler',
  actions: 'action handler',
  guards: 'guard handler',
  transitions: 'transition handler',
  mappers: 'mapper handler',
  components: 'component',
}

function assertRegistered(
  registry: HandlerRegistry,
  kind: keyof HandlerRegistry,
  id: string,
  location: string,
): void {
  const bucket = registry[kind]
  if (!bucket || !Object.hasOwn(bucket, id)) {
    throw new Error(
      `loadWorkflow: missing ${REGISTRY_NOUNS[kind]} "${id}" referenced at ${location}`,
    )
  }
}

function validateTransitionTarget(
  config: WorkflowConfig,
  target: string,
  location: string,
): void {
  if (target.startsWith('/'))
    return
  if (!isStepId(config, target)) {
    throw new Error(
      `loadWorkflow: transition target "${target}" at ${location} is not a known step id or external route`,
    )
  }
}

function validateStepHandlers(
  step: StepConfig,
  registry: HandlerRegistry,
  stepId: string,
): void {
  for (const input of step.interactions.inputs ?? []) {
    if (input.source?.handler) {
      assertRegistered(
        registry,
        'loaders',
        input.source.handler,
        `step "${stepId}" input "${input.field}" source.handler`,
      )
    }
    if (input.validate) {
      assertRegistered(
        registry,
        'validators',
        input.validate,
        `step "${stepId}" input "${input.field}" validate`,
      )
    }
    if (input.when && isGuardHandlerReference(input.when))
      assertRegistered(registry, 'guards', input.when, `step "${stepId}" input "${input.field}" when`)

    if (input.component) {
      assertRegistered(
        registry,
        'components',
        input.component,
        `step "${stepId}" input "${input.field}" component`,
      )
    }
  }

  for (const action of step.interactions.actions ?? []) {
    if (action.handler) {
      const kind = action.effect === 'fetch'
        ? 'loaders'
        : 'actions'
      assertRegistered(registry, kind, action.handler, `step "${stepId}" action "${action.id}" handler`)
    }
  }

  for (const [index, transition] of step.interactions.transitions.entries()) {
    const location = `step "${stepId}" transition[${index}]`
    if (transition.dynamic)
      assertRegistered(registry, 'transitions', transition.dynamic, `${location} dynamic`)

    if (transition.when && isGuardHandlerReference(transition.when))
      assertRegistered(registry, 'guards', transition.when, `${location} when`)
  }
}

function validateStepUniqueness(step: StepConfig, stepId: string): void {
  const fields = new Set<string>()
  for (const input of step.interactions.inputs ?? []) {
    if (fields.has(input.field)) {
      throw new Error(
        `loadWorkflow: step "${stepId}" has duplicate input field "${input.field}"`,
      )
    }
    fields.add(input.field)
  }

  const actionIds = new Set<string>()
  for (const action of step.interactions.actions ?? []) {
    if (actionIds.has(action.id)) {
      throw new Error(
        `loadWorkflow: step "${stepId}" has duplicate action id "${action.id}"`,
      )
    }
    actionIds.add(action.id)
  }
}

function validateStepTargets(config: WorkflowConfig, step: StepConfig, stepId: string): void {
  for (const action of step.interactions.actions ?? []) {
    if (action.onError && action.onError !== 'stay') {
      validateTransitionTarget(
        config,
        action.onError,
        `step "${stepId}" action "${action.id}" onError`,
      )
    }
  }

  for (const [index, transition] of step.interactions.transitions.entries()) {
    if (transition.target) {
      validateTransitionTarget(
        config,
        transition.target,
        `step "${stepId}" transition[${index}] target`,
      )
    }
  }
}

function validateUniqueRoutes(config: WorkflowConfig): void {
  const seen = new Map<string, string>()
  for (const step of config.steps) {
    const route = stepRoute(config, step)
    const owner = seen.get(route)
    if (owner) {
      throw new Error(
        `loadWorkflow: steps "${owner}" and "${step.id}" resolve to the same route "${route}"`,
      )
    }
    seen.set(route, step.id)
  }
}

function validateStepAvailability(
  stepId: string,
  availableKeys: Set<string>,
  step: StepConfig,
): void {
  for (const key of step.requires ?? []) {
    if (!availableKeys.has(key)) {
      throw new Error(
        `loadWorkflow: step "${stepId}" requires context key "${key}" which is not produced upstream or declared as a global`,
      )
    }
  }

  // A composite gets only the keys it declares, so an unproducible one would arrive
  // as undefined inside a black box the engine can't see into. Catch it here instead.
  for (const input of step.interactions.inputs ?? []) {
    for (const [componentKey, contextKey] of Object.entries(input.reads ?? {})) {
      if (!availableKeys.has(contextKey)) {
        throw new Error(
          `loadWorkflow: step "${stepId}" input "${input.field}" reads.${componentKey} maps to context key "${contextKey}" which is not produced upstream or declared as a global`,
        )
      }
    }
  }
}

function validateArrayModeAvailability(config: WorkflowConfig): void {
  const availableKeys = new Set(config.context?.globals ?? [])

  for (const step of config.steps) {
    validateStepAvailability(step.id, availableKeys, step)
    for (const key of step.output?.produces ?? [])
      availableKeys.add(key)
  }
}

function validateTransitionModeAvailability(config: WorkflowConfig): void {
  const reachable = reachableStepIdsIncludingErrors(config)

  // Any step that some other step transitions into (via a static step-id target).
  const targeted = new Set<string>()
  for (const targets of buildSuccessorsMap(config).values()) {
    for (const target of targets)
      targeted.add(target)
  }
  for (const targets of buildErrorSuccessorsMap(config).values()) {
    for (const target of targets)
      targeted.add(target)
  }

  for (const step of config.steps) {
    if (reachable.has(step.id))
      continue

    // Distinguish the two failure shapes: a step nothing transitions into (an
    // orphan) vs. one reached only through other unreachable steps (an island).
    if (!targeted.has(step.id)) {
      throw new Error(
        `loadWorkflow: orphan step "${step.id}" — no transition targets it, so it can never be reached from entry "${config.entry}". Add a transition with target: "${step.id}", or make it the entry.`,
      )
    }

    throw new Error(
      `loadWorkflow: step "${step.id}" is unreachable from entry "${config.entry}" — it is only targeted by other unreachable steps. Connect it to a step on the path from "${config.entry}".`,
    )
  }

  // Guaranteed-key availability uses transition edges only: keys present on an onError
  // recovery path depend on where the failure occurred, so they are indeterminate.
  const guaranteed = computeGuaranteedAvailableKeys(config)

  for (const step of config.steps) {
    const availableKeys = guaranteed.get(step.id)
    if (!availableKeys)
      continue
    validateStepAvailability(step.id, availableKeys, step)
  }
}

function validateReferentialIntegrity(config: WorkflowConfig, registry?: HandlerRegistry): void {
  if (!isStepId(config, config.entry))
    throw new Error(`loadWorkflow: entry "${config.entry}" is not a known step id`)

  validateUniqueRoutes(config)

  for (const step of config.steps)
    validateStepTargets(config, step, step.id)

  const orderMode = getStepOrderMode(config)
  if (orderMode === 'array')
    validateArrayModeAvailability(config)
  else
    validateTransitionModeAvailability(config)

  for (const step of config.steps) {
    const stepId = step.id
    validateStepUniqueness(step, stepId)

    if (registry)
      validateStepHandlers(step, registry, stepId)
  }
}

export interface SafeLoadWorkflowSuccess { ok: true, config: WorkflowConfig }
export interface SafeLoadWorkflowFailure {
  ok: false
  error: string
  cause?: unknown
  basePath?: string
  workflow?: string
}
export type SafeLoadWorkflowResult = SafeLoadWorkflowSuccess | SafeLoadWorkflowFailure

function extractWorkflowMetadata(parsed: unknown): Pick<SafeLoadWorkflowFailure, 'basePath' | 'workflow'> {
  if (typeof parsed !== 'object' || parsed === null)
    return {}

  const record = parsed as Record<string, unknown>
  return {
    basePath: typeof record.basePath === 'string'
      ? record.basePath
      : undefined,
    workflow: typeof record.workflow === 'string'
      ? record.workflow
      : undefined,
  }
}

/**
 * Parse and validate workflow YAML without throwing. On failure, best-effort
 * extracts `basePath` / `workflow` from the parsed object when YAML parsed.
 */
export function safeLoadWorkflow(
  yamlText: string,
  registry?: HandlerRegistry,
): SafeLoadWorkflowResult {
  let parsed: unknown
  try {
    parsed = parseYaml(yamlText)
  } catch (err) {
    return { ok: false, error: `loadWorkflow: invalid YAML — ${String(err)}`, cause: err }
  }

  const result = workflowConfigSchema.safeParse(parsed)
  if (!result.success) {
    const detail = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ')
    return {
      ok: false,
      error: `loadWorkflow: invalid workflow shape — ${detail}`,
      cause: result.error,
      ...extractWorkflowMetadata(parsed),
    }
  }

  const config = result.data as WorkflowConfig
  try {
    validateReferentialIntegrity(config, registry)
  } catch (err) {
    return {
      ok: false,
      error: toErrorMessage(err),
      cause: err,
      basePath: config.basePath,
      workflow: config.workflow,
    }
  }

  return { ok: true, config }
}

/**
 * Parse YAML workflow text, validate shape (zod) and referential integrity.
 * Pass `registry` to fail fast on missing handler references.
 */
export function loadWorkflow(yamlText: string, registry?: HandlerRegistry): WorkflowConfig {
  const result = safeLoadWorkflow(yamlText, registry)
  if (!result.ok)
    throw new Error(result.error, { cause: result.cause })

  return result.config
}
