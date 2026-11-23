import type { Component, ShallowRef, VNode } from 'vue'
import { shallowRef } from 'vue'

const footerRight = shallowRef<Component | (() => VNode) | null>(null)

/** Set trailing footer chrome (e.g. fugue-content-site Edit entry) — clear with `null` on unmount. */
export function setShellFooterRight(actions: Component | (() => VNode) | null) {
  footerRight.value = actions
}

export function useShellFooterRight(): ShallowRef<Component | (() => VNode) | null> {
  return footerRight
}
