import type { Component, ShallowRef, VNode } from 'vue'
import { shallowRef } from 'vue'

const headerActions = shallowRef<Component | (() => VNode) | null>(null)

/** Set header actions for the current page (clear with `null` on unmount). */
export function setShellHeaderActions(actions: Component | (() => VNode) | null) {
  headerActions.value = actions
}

/** @deprecated Prefer `setShellHeaderActions` from pages with lifecycle cleanup. */
export function provideShellHeaderActions(actions: Component | (() => VNode)) {
  setShellHeaderActions(actions)
}

export function useShellHeaderActions(): ShallowRef<Component | (() => VNode) | null> {
  return headerActions
}
