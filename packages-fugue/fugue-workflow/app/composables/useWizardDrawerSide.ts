import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { DrawerSide, ResolvedDrawerConfig } from '#orchestrator'
import { DRAWER_SIDES } from '#orchestrator'

export interface WizardDrawerSide {
  /** Side to hand `UDrawer`: the user's pick while relocatable, else the configured side. */
  side: ComputedRef<DrawerSide>
  relocatable: ComputedRef<boolean>
  setSide: (next: DrawerSide) => void
}

function storageKey(workflowId: string): string {
  return `workflow:${workflowId}:drawerSide`
}

function isDrawerSide(value: unknown): value is DrawerSide {
  return DRAWER_SIDES.includes(value as DrawerSide)
}

function readStoredSide(key: string): DrawerSide | undefined {
  try {
    const raw = localStorage.getItem(key)
    return isDrawerSide(raw)
      ? raw
      : undefined
  } catch {
    return undefined
  }
}

function writeStoredSide(key: string, side: DrawerSide): void {
  try {
    localStorage.setItem(key, side)
  } catch {
    // best-effort persistence; ignore (private mode / quota)
  }
}

/**
 * Runtime drawer placement for one workflow: the configured side is the default and
 * the user's relocate pick (persisted per workflow) wins while `relocatable` is on.
 */
export function useWizardDrawerSide(
  workflowId: string,
  drawer: MaybeRefOrGetter<ResolvedDrawerConfig>,
): WizardDrawerSide {
  const key = storageKey(workflowId)
  const picked = ref<DrawerSide | undefined>(readStoredSide(key))

  const relocatable = computed(() => toValue(drawer).relocatable)

  const side = computed<DrawerSide>(() => {
    const configured = toValue(drawer).side
    return relocatable.value
      ? picked.value ?? configured
      : configured
  })

  function setSide(next: DrawerSide): void {
    picked.value = next
    writeStoredSide(key, next)
  }

  return { side, relocatable, setSide }
}
