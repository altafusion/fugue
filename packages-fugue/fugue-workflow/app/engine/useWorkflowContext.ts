import type { Store } from 'pinia'
import type { Ref } from 'vue'
import type { WorkflowContext } from '../types/workflow'
import { defineStore, storeToRefs } from 'pinia'
import { ref, watch } from 'vue'

export interface WorkflowContextStore {
  state: Ref<WorkflowContext>
  /** Furthest step id reached in a persisted draft — mirrors the stepper frontier. */
  maxVisitedStepId: Ref<string | undefined>
  get: (key: string) => unknown
  /** True only when the key exists AND holds a usable value (not empty/null/undefined). */
  hasValue: (key: string) => boolean
  set: (key: string, value: unknown) => void
  merge: (patch: Partial<WorkflowContext>) => void
  remove: (keys: string[]) => void
  setMaxVisitedStepId: (id: string | undefined) => void
  reset: () => void
}

export interface UseWorkflowContextOptions {
  version?: number | string
  persist?: boolean
}

function isPresent(value: unknown): boolean {
  return value !== null && value !== undefined && value !== ''
}

function storageKeyFor(workflowId: string): string {
  return `workflow:${workflowId}`
}

interface StoredWorkflowContext {
  version?: number | string
  context?: WorkflowContext
  maxVisitedStepId?: string
}

interface HydratedWorkflowContext {
  context: WorkflowContext
  maxVisitedStepId?: string
}

// This engine assumes a client-only SPA (`ssr: false`) whose workflow routes are never
// prerendered, so it only runs in the browser — `localStorage` is accessed directly,
// with no SSR/prerender guards.
function readStoredContext(
  key: string,
  version: number | string | undefined,
): HydratedWorkflowContext | undefined {
  try {
    const raw = localStorage.getItem(key)
    if (!raw)
      return undefined

    const stored = JSON.parse(raw) as StoredWorkflowContext
    if (stored.version !== version || !stored.context)
      return undefined

    return {
      context: { ...stored.context },
      maxVisitedStepId: stored.maxVisitedStepId,
    }
  } catch {
    return undefined
  }
}

function readStoredContextForWorkflow(
  workflowId: string,
  version: number | string | undefined,
): HydratedWorkflowContext | undefined {
  const key = storageKeyFor(workflowId)
  return readStoredContext(key, version)
}

function writeStoredContext(
  key: string,
  version: number | string | undefined,
  context: WorkflowContext,
  maxVisitedStepId: string | undefined,
): boolean {
  // Persistence is best-effort: private modes / quota (QuotaExceededError) can throw.
  // Since this runs inside a reactive watcher, swallow so a failed write can't crash the engine.
  try {
    // `undefined` maxVisitedStepId is omitted by JSON.stringify; keep empty-string ids.
    localStorage.setItem(key, JSON.stringify({
      version,
      context,
      maxVisitedStepId,
    }))
    return true
  } catch {
    // best-effort persistence; ignore (private mode / quota)
    return false
  }
}

function removeStoredContext(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // best-effort persistence; ignore (private mode / quota)
  }
}

interface WorkflowContextPiniaState {
  state: WorkflowContext
  /** Always present on the store; value may be unset. */
  maxVisitedStepId: string | undefined
}

interface WorkflowContextPiniaActions {
  get: (key: string) => unknown
  hasValue: (key: string) => boolean
  set: (key: string, value: unknown) => void
  merge: (patch: Partial<WorkflowContext>) => void
  remove: (keys: string[]) => void
  setMaxVisitedStepId: (id: string | undefined) => void
  reset: () => void
}

type WorkflowContextPiniaStore = Store<
  string,
  WorkflowContextPiniaState,
  Record<string, never>,
  WorkflowContextPiniaActions
>

const storeDefs = new Map<string, () => WorkflowContextPiniaStore>()

function defineWorkflowContextStore(
  storeId: string,
  storageKey: string,
  workflowId: string,
  version: number | string | undefined,
  shouldPersist: boolean,
): () => WorkflowContextPiniaStore {
  return defineStore(storeId, () => {
    const hydrated = shouldPersist
      ? readStoredContextForWorkflow(workflowId, version)
      : undefined
    const state = ref<WorkflowContext>(hydrated?.context ?? {})
    const maxVisitedStepId = ref<string | undefined>(hydrated?.maxVisitedStepId)

    function get(key: string): unknown {
      return state.value[key]
    }

    function hasValue(key: string): boolean {
      if (!Object.hasOwn(state.value, key))
        return false
      return isPresent(state.value[key])
    }

    function set(key: string, value: unknown): void {
      state.value[key] = value
    }

    function merge(patch: Partial<WorkflowContext>): void {
      Object.assign(state.value, patch)
    }

    function remove(keys: string[]): void {
      for (const key of keys)
        Reflect.deleteProperty(state.value, key)
    }

    function setMaxVisitedStepId(id: string | undefined): void {
      maxVisitedStepId.value = id
    }

    function reset(): void {
      // The persistence watcher (below) removes storage when state becomes empty.
      state.value = {}
      maxVisitedStepId.value = undefined
    }

    if (shouldPersist) {
      // Persist on change. Living inside the store setup ties this watcher to the STORE's
      // lifecycle (not a component's), so it survives the two-file deploy mount
      // (`index.vue` ↔ `[...slug].vue`, the nuxt#32408 workaround) with no module-level
      // "already subscribed" guard. Default (batched, async) flush coalesces multi-key
      // writes (`merge`/`remove`) into one localStorage write per tick. Treating an empty
      // context as "remove the key" keeps `reset()` deterministic without sync flush.
      watch([state, maxVisitedStepId], ([value, stepId]) => {
        if (Object.keys(value).length === 0 && !stepId)
          removeStoredContext(storageKey)
        else
          writeStoredContext(storageKey, version, value, stepId)
      }, { deep: true })
    }

    return {
      state,
      maxVisitedStepId,
      get,
      hasValue,
      set,
      merge,
      remove,
      setMaxVisitedStepId,
      reset,
    }
  }) as unknown as () => WorkflowContextPiniaStore
}

function getOrCreateStoreDef(
  workflowId: string,
  options?: UseWorkflowContextOptions,
): () => WorkflowContextPiniaStore {
  const storeId = `workflow-context:${workflowId}`
  let useStore = storeDefs.get(storeId)
  if (!useStore) {
    const storageKey = storageKeyFor(workflowId)
    const version = options?.version
    const shouldPersist = options?.persist === true
    useStore = defineWorkflowContextStore(storeId, storageKey, workflowId, version, shouldPersist)
    storeDefs.set(storeId, useStore)
  }
  return useStore
}

/**
 * Shared Context store, scoped per workflow id.
 * Opt-in persistence mirrors Context to localStorage (version-gated; client only).
 */
export function useWorkflowContext(
  workflowId: string,
  options?: UseWorkflowContextOptions,
): WorkflowContextStore {
  const useStore = getOrCreateStoreDef(workflowId, options)
  const piniaStore = useStore()
  const { state, maxVisitedStepId } = storeToRefs(piniaStore)

  return {
    state,
    maxVisitedStepId,
    get: piniaStore.get,
    hasValue: piniaStore.hasValue,
    set: piniaStore.set,
    merge: piniaStore.merge,
    remove: piniaStore.remove,
    setMaxVisitedStepId: piniaStore.setMaxVisitedStepId,
    reset: piniaStore.reset,
  }
}
