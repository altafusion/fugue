/**
 * Pure position math for the Floating Dock. No Vue, no Nuxt.
 * The snap to centre is adapted from `dock-layout.ts` in `devframes/devframe` (MIT).
 *
 * The dock's position is one number, `percent` (0 to 100): 0 is flush left, 100 is flush right, 50 is centred, whatever the
 * bar's width. The bar is placed with CSS only (`left` of `percent` plus a matching `translateX`), so nothing is measured.
 */

/** A percentage within this distance of the middle snaps to 50. */
export const CENTER_SNAP_PERCENT = 2

/** Snap a 0 to 100 percentage to the middle of the viewport when it is close to it. */
export function snapToCenter(percent: number, snap = CENTER_SNAP_PERCENT): number {
  return Math.abs(percent - 50) < snap
    ? 50
    : percent
}

/** A usable percentage: `value` limited to 0 to 100, or `fallback` when it is not a finite number (a damaged saved value). */
export function clampPercent(value: unknown, fallback = 50): number {
  const number = typeof value === 'number'
    ? value
    : Number.NaN
  if (!Number.isFinite(number))
    return fallback
  return Math.min(Math.max(number, 0), 100)
}

/** The CSS `left` and `transform` that place a bar at `percent`, `margin` px from each edge at the extremes. */
export function dockPlacement(percent: number, margin = 8): { left: string, transform: string } {
  return {
    left: `calc(${margin}px + (100% - ${margin * 2}px) * ${percent / 100})`,
    transform: `translateX(-${percent}%)`,
  }
}

/**
 * The percentage that puts the bar's left edge at `leftEdgePx`, the inverse of `dockPlacement`. Clamped to 0 to 100 and
 * snapped to the middle. A bar as wide as the room it has stays at 50.
 */
export function leftEdgeToPercent(params: {
  leftEdgePx: number
  dockWidth: number
  viewportWidth: number
  margin?: number
}): number {
  const { leftEdgePx, dockWidth, viewportWidth, margin = 8 } = params
  const room = viewportWidth - margin * 2 - dockWidth
  if (room <= 0)
    return 50
  const percent = Math.min(Math.max((leftEdgePx - margin) / room * 100, 0), 100)
  return snapToCenter(percent)
}
