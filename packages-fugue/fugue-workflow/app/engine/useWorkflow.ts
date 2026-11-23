import type {
  EffectState,
  HandlerRegistry,
  InputConfig,
  LoadFromRecipeOptions,
  StepConfig,
  UseWorkflowOptions,
  UseWorkflowReturn,
  WorkflowActionError,
  WorkflowContext,
} from '../types/workflow'
import { computed, ref, watch } from 'vue'
import { recoveryStepId } from './actionRecovery'
import { toErrorMessage } from './errorMessage'
import { evaluateWhen } from './evaluateGuard'
import { deriveStepOrder, getStepOrderMode, nextStepInOrder } from './orderSteps'
import { isPresent, sanitizeRecipeContext } from './recipeContext'
import { downstreamProducedKeys, findStepById, nearestSatisfiableStep, resolveNavigationTarget, resolveStep } from './resolveStep'
import { resolveTransition } from './resolveTransition'
import { resolveStepperConfig } from './stepperConfig'
import { useWorkflowContext } from './useWorkflowContext'

export type StepPresentation = 'inline' | 'drawer' | 'modal'

export function getStepPresentation(step: StepConfig): StepPresentation {
  return step.presentation ?? 'inline'
}

export function isOverlayStepPresentation(step: StepConfig): boolean {
  const presentation = getStepPresentation(step)
  return presentation === 'drawer' || presentation === 'modal'
}

/** Seed step field values from Context, then optional input defaults. Does not write to Context. */
export function initInputValues(
  step: StepConfig,
  getContextValue: (field: string) => unknown,
): WorkflowContext {
  const next: WorkflowContext = {}
  for (const input of step.interactions.inputs ?? []) {
    const existing = getContextValue(input.field)
    if (existing !== undefined)
      next[input.field] = existing
    else if (input.default !== undefined)
      next[input.field] = structuredClone(input.default)
  }
  return next
}

function initValuesFromContext(
  step: StepConfig,
  ctxStore: ReturnType<typeof useWorkflowContext>,
): WorkflowContext {
  return initInputValues(step, field => ctxStore.get(field))
}

export function filterVisibleInputs(
  inputs: InputConfig[] | undefined,
  ctx: WorkflowContext,
  registry: HandlerRegistry,
): InputConfig[] {
  if (!inputs?.length)
    return []

  return inputs.filter((input) => {
    if (!input.when)
      return true
    return evaluateWhen(input.when, ctx, registry)
  })
}

/**
 * Required visible inputs not yet satisfied — the reason `stepCanComplete` is false.
 *
 * A `composite` is satisfied by the readiness its component reports, not by holding
 * a value: an upload session may already carry a file while still having no artifact
 * to hand downstream. Every other type is satisfied by a non-empty value.
 */
export function missingRequiredInputs(
  visibleInputs: InputConfig[],
  values: WorkflowContext,
  compositeReady: Record<string, boolean> = {},
): InputConfig[] {
  return visibleInputs.filter((input) => {
    if (!input.required)
      return false
    if (input.type === 'composite')
      return !compositeReady[input.field]
    const value = values[input.field]
    return !isPresent(value)
  })
}

export function stepCanComplete(
  visibleInputs: InputConfig[],
  values: WorkflowContext,
  fieldErrors: Record<string, string | undefined>,
  compositeReady: Record<string, boolean> = {},
): boolean {
  if (visibleInputs.some(input => fieldErrors[input.field]))
    return false
  return missingRequiredInputs(visibleInputs, values, compositeReady).length === 0
}

function deepEqualPlain(a: unknown, b: unknown): boolean {
  if (a === b)
    return true
  if (a === null || b === null || a === undefined || b === undefined)
    return false
  if (typeof a !== typeof b)
    return false
  if (typeof a !== 'object')
    return false

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length)
      return false
    return a.every((item, index) => deepEqualPlain(item, b[index]))
  }

  if (Array.isArray(b))
    return false

  const aObj = a as Record<string, unknown>
  const bObj = b as Record<string, unknown>
  const aKeys = Object.keys(aObj)
  if (aKeys.length !== Object.keys(bObj).length)
    return false
  return aKeys.every(key => Object.hasOwn(bObj, key) && deepEqualPlain(aObj[key], bObj[key]))
}

/** True when two workflow field values are structurally the same. */
export function workflowValuesEqual(a: unknown, b: unknown): boolean {
  if (a === b)
    return true
  return deepEqualPlain(a, b)
}

function isGlobalsValuePresent(value: unknown): boolean {
  return value !== null && value !== undefined && value !== ''
}

/** Globals patch with only present values — absent keys must not wipe Context on merge. */
function presentGlobals(globals: Partial<WorkflowContext> | undefined): Partial<WorkflowContext> {
  if (!globals)
    return {}
  const present: Partial<WorkflowContext> = {}
  for (const [key, value] of Object.entries(globals)) {
    if (isGlobalsValuePresent(value))
      present[key] = value
  }
  return present
}

/**
 * Draft-complete for frontier inference: visible required inputs satisfied by
 * Context value presence (composites included); optional steps never claim
 * completion when empty; otherwise `requires`, then `produces`.
 */
export function stepIsDraftComplete(
  step: StepConfig,
  hasValue: (key: string) => boolean,
  context: WorkflowContext,
  registry: HandlerRegistry = {},
): boolean {
  const visibleInputs = filterVisibleInputs(step.interactions?.inputs, context, registry)
  const requiredVisible = visibleInputs.filter(input => input.required)

  if (requiredVisible.length >= 1)
    return requiredVisible.every(input => hasValue(input.field))

  if (step.optional)
    return false

  const requires = step.requires ?? []
  if (requires.length > 0)
    return requires.every(key => hasValue(key))

  const produces = step.output?.produces ?? []
  if (produces.length > 0)
    return produces.every(key => hasValue(key))

  return true
}

/**
 * Infer the visited frontier from persisted Context for drafts saved before
 * `maxVisitedStepId` existed. Walks steps in order; optional and overlay
 * steps soft-skip when incomplete so later completed steps still extend the frontier.
 */
export function inferMaxVisitedIndexFromContext(
  orderedSteps: StepConfig[],
  hasValue: (key: string) => boolean,
  context: WorkflowContext = {},
  registry: HandlerRegistry = {},
): number {
  let furthest = 0
  for (let index = 0; index < orderedSteps.length; index++) {
    const step = orderedSteps[index]!
    if (stepIsDraftComplete(step, hasValue, context, registry))
      furthest = index
    else if (isOverlayStepPresentation(step) || step.optional)
      continue
    else
      break
  }
  return furthest
}

/**
 * Domain-free workflow engine composable.
 * See 2.step-lifecycle.md + 4.engine-and-registry.md.
 */
export function useWorkflow(options: UseWorkflowOptions): UseWorkflowReturn {
  const { config, registry, globals } = options
  const ctxStore = useWorkflowContext(config.workflow, {
    version: config.version,
    persist: config.context?.persist === true,
  })
  const route = useRoute()
  const router = useRouter()

  const mergedGlobals = presentGlobals(globals)
  if (Object.keys(mergedGlobals).length > 0)
    ctxStore.merge(mergedGlobals)

  const values = ref<WorkflowContext>({})
  const fieldErrors = ref<Record<string, string | undefined>>({})
  // Readiness reported by `composite` components, by field. Owned by the component,
  // so it resets with the step rather than persisting to Context.
  const compositeReady = ref<Record<string, boolean>>({})
  const showValidation = ref(false)
  const effects = ref<Record<string, EffectState>>({})
  const actionError = ref<WorkflowActionError | null>(null)
  const fieldOptions = ref<Record<string, unknown[]>>({})
  const orderedSteps = deriveStepOrder(config)
  const shouldPersist = config.context?.persist === true
  // Completed frontier: the furthest derived-order index reached this session. Steps up to it stay
  // clickable even after jumping back, so users can move freely among completed steps.
  const maxVisitedIndex = ref(0)
  let suppressFrontierSync = false
  let runGeneration = 0

  function indexOfStep(stepId: string | undefined): number {
    if (!stepId)
      return -1
    return orderedSteps.findIndex(step => step.id === stepId)
  }

  if (shouldPersist) {
    const storedStepId = ctxStore.maxVisitedStepId.value
    if (storedStepId) {
      const storedIndex = indexOfStep(storedStepId)
      if (storedIndex >= 0) {
        maxVisitedIndex.value = storedIndex
      } else {
        maxVisitedIndex.value = inferMaxVisitedIndexFromContext(
          orderedSteps,
          key => ctxStore.hasValue(key),
          ctxStore.state.value,
          registry,
        )
      }
    } else {
      maxVisitedIndex.value = inferMaxVisitedIndexFromContext(
        orderedSteps,
        key => ctxStore.hasValue(key),
        ctxStore.state.value,
        registry,
      )
    }
  }

  watch(maxVisitedIndex, (index) => {
    if (!shouldPersist || suppressFrontierSync)
      return
    const stepId = orderedSteps[index]?.id
    ctxStore.setMaxVisitedStepId(stepId)
  }, { flush: 'sync' })

  const currentStep = computed(() => resolveStep(config, route.path))

  const steps = computed(() =>
    orderedSteps
      .filter(step => !isOverlayStepPresentation(step))
      .map((step) => {
        const stepper = resolveStepperConfig(config, step)
        return {
          id: step.id,
          label: stepper.label,
          description: stepper.description,
        }
      }),
  )

  function workflowCtx(): WorkflowContext {
    return {
      ...ctxStore.state.value,
      ...values.value,
    }
  }

  const visibleInputs = computed(() => {
    const step = currentStep.value
    if (!step?.interactions.inputs)
      return []
    return filterVisibleInputs(step.interactions.inputs, workflowCtx(), registry)
  })

  const canComplete = computed(() => {
    if (!currentStep.value)
      return false
    return stepCanComplete(visibleInputs.value, values.value, fieldErrors.value, compositeReady.value)
  })

  const isBusy = computed(() =>
    Object.values(effects.value).some(effect => effect.status === 'loading'),
  )

  /**
   * Busy flag for input rendering. Excludes `validate:` effects: field validation runs on
   * every keystroke, and disabling a focused input mid-type makes the browser drop focus.
   * `fetch` (options loading) and `mutate` (submitting) still freeze inputs.
   */
  const isInputBusy = computed(() =>
    Object.entries(effects.value)
      .some(([key, effect]) => effect.status === 'loading' && !key.startsWith('validate:')),
  )

  // A bullet is clickable when the step itself opts in (`stepper.navigable`, defaulting
  // to the flow-wide value) AND it sits within the visited frontier.
  const navigableStepIds = computed<string[]>(() => {
    const currentId = currentStep.value?.id
    const frontier = Math.max(maxVisitedIndex.value, indexOfStep(currentId))
    return orderedSteps
      .filter((step, index) => index <= frontier && step.id !== currentId)
      .filter(step => !isOverlayStepPresentation(step))
      .filter(step => resolveStepperConfig(config, step).navigable)
      .map(step => step.id)
  })

  async function runFetch(handler: string, field: string): Promise<void> {
    const generation = runGeneration
    const effectKey = `fetch:${handler}`
    const loader = registry.loaders?.[handler]
    if (!loader) {
      if (generation !== runGeneration)
        return
      effects.value = {
        ...effects.value,
        [effectKey]: { status: 'error', error: `Missing loader: ${handler}` },
      }
      return
    }

    if (generation !== runGeneration)
      return
    effects.value = {
      ...effects.value,
      [effectKey]: { status: 'loading' },
    }
    try {
      const result = await loader(ctxStore.state.value)
      if (generation !== runGeneration)
        return
      // A field `source` loads that field's option list; keep it separate from
      // the field's selected value (both would otherwise share the field key).
      if (Array.isArray(result))
        fieldOptions.value = { ...fieldOptions.value, [field]: result }
      else if (typeof result === 'object' && result !== null)
        ctxStore.merge(result as Partial<WorkflowContext>)
      else
        ctxStore.set(field, result)
      effects.value = {
        ...effects.value,
        [effectKey]: { status: 'success' },
      }
    } catch (err) {
      if (generation !== runGeneration)
        return
      // Drop any previously loaded options so a failed refetch can't leave stale choices on screen.
      fieldOptions.value = { ...fieldOptions.value, [field]: [] }
      effects.value = {
        ...effects.value,
        [effectKey]: {
          status: 'error',
          error: toErrorMessage(err),
        },
      }
    }
  }

  function clearActionError(): void {
    actionError.value = null
  }

  function recordActionError(
    stepId: string,
    label: string,
    message: string,
  ): void {
    actionError.value = { stepId, label, message }
  }

  async function runFieldValidate(field: string, value: unknown, validatorId: string): Promise<void> {
    const generation = runGeneration
    const validator = registry.validators?.[validatorId]
    if (!validator)
      return

    const effectKey = `validate:${field}:${validatorId}`
    if (generation !== runGeneration)
      return
    effects.value = {
      ...effects.value,
      [effectKey]: { status: 'loading' },
    }
    try {
      const error = await validator(value, ctxStore.state.value)
      if (generation !== runGeneration)
        return
      fieldErrors.value = { ...fieldErrors.value, [field]: error ?? undefined }
      effects.value = {
        ...effects.value,
        [effectKey]: {
          status: error ? 'error' : 'success',
          error: error ?? undefined,
        },
      }
    } catch (err) {
      if (generation !== runGeneration)
        return
      const message = toErrorMessage(err)
      fieldErrors.value = { ...fieldErrors.value, [field]: message }
      effects.value = {
        ...effects.value,
        [effectKey]: { status: 'error', error: message },
      }
    }
  }

  async function enterStep(step: StepConfig): Promise<void> {
    const requires = step.requires ?? []
    if (requires.some(key => !ctxStore.hasValue(key))) {
      const target = nearestSatisfiableStep(config, key => ctxStore.hasValue(key), orderedSteps)
      if (target.id !== step.id) {
        await navigateTo(resolveNavigationTarget(config, target.id))
        return
      }
    }

    // Grow the completed frontier once we've committed to entering this step.
    maxVisitedIndex.value = Math.max(maxVisitedIndex.value, indexOfStep(step.id))

    values.value = initValuesFromContext(step, ctxStore)
    fieldErrors.value = {}
    compositeReady.value = {}
    showValidation.value = false

    // Skip fetches for inputs hidden by their `when` guard — those requests are
    // unnecessary and may fail when their data dependencies aren't satisfied yet.
    const ctx = {
      ...ctxStore.state.value,
      ...values.value,
    }
    const fetchPromises = (step.interactions.inputs ?? [])
      .filter(input => input.source?.effect === 'fetch' && input.source.handler)
      .filter(input => !input.when || evaluateWhen(input.when, ctx, registry))
      .map(input => runFetch(input.source!.handler, input.field))
    await Promise.all(fetchPromises)
  }

  watch(
    () => route.path,
    () => {
      const step = currentStep.value
      if (step)
        void enterStep(step)
    },
    { immediate: true },
  )

  function setValue(field: string, value: unknown): void {
    const changed = !workflowValuesEqual(ctxStore.get(field), value)
    values.value = { ...values.value, [field]: value }
    // Write through to Context immediately so the store (and its localStorage mirror +
    // devtools) reflect edits as they happen — including edits made on a step reached via
    // Back, which otherwise never committed (Back navigates without merging). Advancing
    // still re-merges as a safety net.
    ctxStore.set(field, value)
    clearActionError()

    const input = currentStep.value?.interactions.inputs?.find(item => item.field === field)

    // Opt-in: only flow-shaping fields invalidate downstream outputs when their value changes.
    if (changed && input?.invalidatesDownstream === true) {
      const stepId = currentStep.value?.id
      if (stepId) {
        ctxStore.remove(downstreamProducedKeys(config, stepId))
        // Downstream data was just cleared, so those steps are no longer complete — pull the
        // frontier back to this step. Forward steps must be re-walked (and re-confirmed).
        maxVisitedIndex.value = indexOfStep(stepId)
      }
    }

    if (input?.validate)
      void runFieldValidate(field, value, input.validate)
  }

  function setCompositeReady(field: string, ready: boolean): void {
    const wasReady = compositeReady.value[field] === true
    compositeReady.value = { ...compositeReady.value, [field]: ready }

    // A composite reports readiness separately from its value, so readiness can drop
    // while the value stands (a session expiring under a re-verify, say). Pull the
    // frontier back or the stepper keeps offering forward steps this step no longer
    // earns. Downstream keys stay: nothing about the value changed.
    //
    // Only on a true → false transition. Step entry clears reported readiness and the
    // component's first report is `false` until it re-verifies, which must not truncate
    // a frontier the user already walked.
    if (wasReady && !ready) {
      const stepId = currentStep.value?.id
      if (stepId)
        maxVisitedIndex.value = indexOfStep(stepId)
    }
  }

  function setFieldError(field: string, error: string | undefined): void {
    fieldErrors.value = { ...fieldErrors.value, [field]: error }
  }

  async function followTransition(event?: string): Promise<void> {
    const step = currentStep.value
    if (!step)
      return

    ctxStore.merge(values.value)

    const target = resolveTransition(step, ctxStore.state.value, event, registry)
    if (target) {
      await navigateTo(resolveNavigationTarget(config, target))
      return
    }

    if (event === undefined && getStepOrderMode(config) === 'array') {
      const next = nextStepInOrder(config, step.id)
      if (next)
        await navigateTo(resolveNavigationTarget(config, next.id))
    }
  }

  async function advance(): Promise<void> {
    if (!canComplete.value) {
      showValidation.value = true
      return
    }
    await followTransition(undefined)
  }

  async function runAction(actionId: string): Promise<void> {
    const generation = runGeneration
    const step = currentStep.value
    if (!step)
      return

    const action = step.interactions.actions?.find(item => item.id === actionId)
    if (!action)
      return

    if ((action.effect === 'mutate' || action.effect === 'fetch') && !canComplete.value) {
      showValidation.value = true
      return
    }

    // Ensure the current step's latest inputs are in Context before the handler runs,
    // so action handlers never see stale field data (values merge again in followTransition).
    ctxStore.merge(values.value)

    if (action.effect === 'mutate' && action.handler) {
      const effectKey = `mutate:${action.handler}`
      const handler = registry.actions?.[action.handler]
      if (!handler) {
        if (generation !== runGeneration)
          return
        const message = `Missing action: ${action.handler}`
        effects.value = {
          ...effects.value,
          [effectKey]: { status: 'error', error: message },
        }
        recordActionError(step.id, action.label, message)
        return
      }

      if (generation !== runGeneration)
        return
      clearActionError()
      effects.value = {
        ...effects.value,
        [effectKey]: { status: 'loading' },
      }
      try {
        const result = await handler(ctxStore.state.value)
        if (generation !== runGeneration)
          return
        ctxStore.merge(result)
        effects.value = {
          ...effects.value,
          [effectKey]: { status: 'success' },
        }
        clearActionError()
        await followTransition(`${actionId}.success`)
        if (generation !== runGeneration)
          return
        ctxStore.reset()
      } catch (err) {
        if (generation !== runGeneration)
          return
        effects.value = {
          ...effects.value,
          [effectKey]: {
            status: 'error',
            error: toErrorMessage(err),
          },
        }
        const recoverAt = recoveryStepId(err)
          ?? (action.onError && action.onError !== 'stay'
            ? action.onError
            : undefined)
        recordActionError(recoverAt ?? step.id, action.label, toErrorMessage(err))
        if (recoverAt)
          await navigateTo(resolveNavigationTarget(config, recoverAt))
      }
      return
    }

    if (action.effect === 'fetch' && action.handler) {
      const effectKey = `fetch:${action.handler}`
      const loader = registry.loaders?.[action.handler]
      if (!loader) {
        if (generation !== runGeneration)
          return
        const message = `Missing loader: ${action.handler}`
        effects.value = {
          ...effects.value,
          [effectKey]: { status: 'error', error: message },
        }
        recordActionError(step.id, action.label, message)
        return
      }

      if (generation !== runGeneration)
        return
      clearActionError()
      effects.value = {
        ...effects.value,
        [effectKey]: { status: 'loading' },
      }
      try {
        const result = await loader(ctxStore.state.value)
        if (generation !== runGeneration)
          return
        if (typeof result === 'object' && result !== null && !Array.isArray(result))
          ctxStore.merge(result as Partial<WorkflowContext>)
        effects.value = {
          ...effects.value,
          [effectKey]: { status: 'success' },
        }
        clearActionError()
        await followTransition(`${actionId}.success`)
      } catch (err) {
        if (generation !== runGeneration)
          return
        effects.value = {
          ...effects.value,
          [effectKey]: {
            status: 'error',
            error: toErrorMessage(err),
          },
        }
        const recoverAt = recoveryStepId(err)
          ?? (action.onError && action.onError !== 'stay'
            ? action.onError
            : undefined)
        recordActionError(recoverAt ?? step.id, action.label, toErrorMessage(err))
        if (recoverAt)
          await navigateTo(resolveNavigationTarget(config, recoverAt))
      }
      return
    }

    await followTransition(`${actionId}.success`)
  }

  function back(): void {
    router.back()
  }

  async function goToStep(stepId: string): Promise<void> {
    if (stepId === currentStep.value?.id)
      return
    // Route stays the source of truth; the on-enter `requires` guard still protects the target.
    await navigateTo(resolveNavigationTarget(config, stepId))
  }

  function reset(): void {
    runGeneration += 1
    suppressFrontierSync = true
    ctxStore.reset()
    values.value = {}
    fieldErrors.value = {}
    compositeReady.value = {}
    effects.value = {}
    actionError.value = null
    fieldOptions.value = {}
    showValidation.value = false
    maxVisitedIndex.value = 0
    suppressFrontierSync = false
  }

  async function loadFromRecipe(
    recipeContext: WorkflowContext,
    options?: LoadFromRecipeOptions,
  ): Promise<void> {
    const kind = options?.kind ?? 'template'
    const targetStepId = options?.landOn ?? config.entry
    const targetStep = findStepById(config, targetStepId)
    if (!targetStep)
      throw new Error(`loadFromRecipe: unknown step "${targetStepId}"`)

    reset()
    ctxStore.merge(sanitizeRecipeContext(config, recipeContext, kind))
    const mergedGlobals = presentGlobals(globals)
    if (Object.keys(mergedGlobals).length > 0)
      ctxStore.merge(mergedGlobals)

    // Rebuild the completed frontier from recipe Context so the stepper shows
    // filled/navigable steps immediately (reset() cleared maxVisitedIndex).
    maxVisitedIndex.value = inferMaxVisitedIndexFromContext(
      orderedSteps,
      key => ctxStore.hasValue(key),
      ctxStore.state.value,
      registry,
    )

    const targetIndex = indexOfStep(targetStepId)
    // Snapshot hydration may land past the inferred frontier; treat the landed step as visited.
    if (targetIndex >= 0)
      maxVisitedIndex.value = Math.max(maxVisitedIndex.value, targetIndex)

    // Seed the target step from Context. `watch(route.path)` only re-enters on a
    // path change — loading a recipe while already on the target route would otherwise
    // leave `values` empty after `reset()` even though Context was merged.
    const targetPath = resolveNavigationTarget(config, targetStepId)
    const normalize = (path: string) => path.replace(/\/+$/, '') || '/'
    if (normalize(route.path) === normalize(targetPath)) {
      await enterStep(targetStep)
      return
    }

    await navigateTo(targetPath)
  }

  /** Full Context snapshot including uncommitted values on the current step. */
  function snapshotContext(): WorkflowContext {
    return sanitizeRecipeContext(config, {
      ...ctxStore.state.value,
      ...values.value,
    })
  }

  return {
    steps,
    currentStep,
    visibleInputs,
    context: ctxStore.state,
    values,
    fieldErrors,
    effects,
    actionError,
    fieldOptions,
    canComplete,
    isBusy,
    isInputBusy,
    navigableStepIds,
    maxVisitedIndex,
    showValidation,
    setValue,
    setCompositeReady,
    setFieldError,
    runAction,
    advance,
    back,
    goToStep,
    reset,
    loadFromRecipe,
    snapshotContext,
  }
}
