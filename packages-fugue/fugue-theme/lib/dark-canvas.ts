export type DarkCanvas = 'gray' | 'black'

export const DARK_CANVAS_DEFAULT: DarkCanvas = 'gray'

/** Normalize palette / manifest / runtime values to a supported dark canvas id. */
export function normalizeDarkCanvas(value: unknown): DarkCanvas {
  return value === 'black'
    ? 'black'
    : 'gray'
}

export function resolveDarkCanvas(
  manifestValue: unknown,
  paletteValue: unknown,
  fallback: unknown = DARK_CANVAS_DEFAULT,
): DarkCanvas {
  if (manifestValue !== undefined && manifestValue !== null && manifestValue !== '')
    return normalizeDarkCanvas(manifestValue)
  if (paletteValue !== undefined && paletteValue !== null && paletteValue !== '')
    return normalizeDarkCanvas(paletteValue)
  return normalizeDarkCanvas(fallback)
}
