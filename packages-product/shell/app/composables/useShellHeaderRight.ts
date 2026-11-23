import type { Component, ShallowRef, VNode } from 'vue'
import { shallowRef } from 'vue'

const headerRight = shallowRef<Component | (() => VNode) | null>(null)

/** Set trailing header chrome (e.g. editor avatar menu) — clear with `null` on unmount. */
export function setShellHeaderRight(actions: Component | (() => VNode) | null) {
  headerRight.value = actions
}

export function useShellHeaderRight(): ShallowRef<Component | (() => VNode) | null> {
  return headerRight
}
