import { describe, expect, it } from 'vitest'
import { normalizeDarkCanvas, resolveDarkCanvas } from './dark-canvas'

describe('dark-canvas', () => {
  it('normalizeDarkCanvas maps unknown values to gray', () => {
    expect(normalizeDarkCanvas('black')).toBe('black')
    expect(normalizeDarkCanvas('gray')).toBe('gray')
    expect(normalizeDarkCanvas('oops')).toBe('gray')
    expect(normalizeDarkCanvas(undefined)).toBe('gray')
  })

  it('resolveDarkCanvas prefers manifest over palette', () => {
    expect(resolveDarkCanvas('gray', 'black')).toBe('gray')
    expect(resolveDarkCanvas(undefined, 'black')).toBe('black')
    expect(resolveDarkCanvas(null, null, 'black')).toBe('black')
  })
})
