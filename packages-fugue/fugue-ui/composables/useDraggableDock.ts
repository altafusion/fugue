import type { Ref } from 'vue'
import { useDraggable, useLocalStorage } from '@vueuse/core'
import { computed } from 'vue'
import { clampPercent, dockPlacement, leftEdgeToPercent } from '../lib/floating-dock-position'

/** Arrow keys move the bar by this many percent of the room it has; Shift makes it five times that. */
const KEY_STEP_PERCENT = 4

/**
 * Drag a bar left and right along the bottom of the viewport, remembered in the browser under `storageKey`. `el` is the bar
 * and `handle` the part that grabs it (the grip). `area` is the box the bar moves in. VueUse's `useDraggable` does the pointer work (press on the handle, follow
 * the pointer on `window`, stop on release); this turns its pixel position into one percentage, 0 flush left to 100 flush
 * right, so the position holds at any viewport width. `onKeydown` moves it with the arrow keys from a focused grip. The bar is
 * placed with `left` plus `translateX` in CSS, so nothing is measured and the first paint is already right.
 */
export function useDraggableDock(
  el: Ref<HTMLElement | null | undefined>,
  handle: Ref<HTMLElement | null | undefined>,
  area: Ref<HTMLElement | null | undefined>,
  options: { storageKey: string, defaultPercent?: number, margin?: number },
) {
  const { storageKey, defaultPercent = 50, margin = 8 } = options
  const percent = useLocalStorage(storageKey, defaultPercent, { initOnMounted: true })

  // A damaged or hand-edited saved value must not move the bar off the page: read it through `clampPercent`.
  const current = computed(() => clampPercent(percent.value, defaultPercent))
  const dockStyle = computed(() => dockPlacement(current.value, margin))

  const { isDragging: dragging } = useDraggable(el, {
    handle,
    axis: 'x',
    // Cancelling the press keeps the page from starting a text selection or a native drag under the pointer.
    preventDefault: true,
    // `x` is the bar's left edge in viewport pixels; the percentage is measured inside `area`, the box the bar moves in.
    onMove: ({ x }) => {
      const box = area.value?.getBoundingClientRect()
      if (!box || !el.value)
        return
      percent.value = leftEdgeToPercent({
        leftEdgePx: x - box.left,
        dockWidth: el.value.getBoundingClientRect().width,
        viewportWidth: box.width,
        margin,
      })
    },
  })

  function onKeydown(event: KeyboardEvent) {
    const step = KEY_STEP_PERCENT * (event.shiftKey ? 5 : 1)
    const next = {
      ArrowLeft: current.value - step,
      ArrowRight: current.value + step,
      Home: 0,
      End: 100,
    }[event.key]
    if (next === undefined)
      return
    event.preventDefault()
    percent.value = clampPercent(next)
  }

  return {
    percent: current,
    dragging,
    dockStyle,
    onKeydown,
  }
}
