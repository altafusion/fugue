import { describe, expect, it } from 'vitest'
import { clampPercent, dockPlacement, leftEdgeToPercent, snapToCenter } from './floating-dock-position'

describe('snapToCenter', () => {
  it('snaps near the middle and leaves the rest', () => {
    expect(snapToCenter(51)).toBe(50)
    expect(snapToCenter(48.5)).toBe(50)
    expect(snapToCenter(53)).toBe(53)
  })
})

describe('dockPlacement', () => {
  it('pairs left and translate so the bar stays inside the viewport', () => {
    expect(dockPlacement(0)).toEqual({ left: 'calc(8px + (100% - 16px) * 0)', transform: 'translateX(-0%)' })
    expect(dockPlacement(100).transform).toBe('translateX(-100%)')
  })
})

describe('leftEdgeToPercent', () => {
  const base = { dockWidth: 200, viewportWidth: 1000, margin: 8 }
  it('inverts the placement', () => {
    expect(leftEdgeToPercent({ ...base, leftEdgePx: 8 })).toBe(0)
    expect(leftEdgeToPercent({ ...base, leftEdgePx: 792 })).toBe(100)
    expect(leftEdgeToPercent({ ...base, leftEdgePx: 400 })).toBe(50)
  })
  it('clamps outside the viewport', () => {
    expect(leftEdgeToPercent({ ...base, leftEdgePx: -50 })).toBe(0)
    expect(leftEdgeToPercent({ ...base, leftEdgePx: 2000 })).toBe(100)
  })
  it('stays centred when the bar fills the viewport', () => {
    expect(leftEdgeToPercent({ leftEdgePx: 0, dockWidth: 400, viewportWidth: 300 })).toBe(50)
  })
})

describe('clampPercent', () => {
  it('keeps a valid percentage and limits the rest to 0 to 100', () => {
    expect(clampPercent(30)).toBe(30)
    expect(clampPercent(-5)).toBe(0)
    expect(clampPercent(250)).toBe(100)
  })
  it('falls back when the value is not a finite number', () => {
    expect(clampPercent(Number.NaN)).toBe(50)
    expect(clampPercent('abc', 20)).toBe(20)
    expect(clampPercent(undefined, 20)).toBe(20)
    expect(clampPercent(Number.POSITIVE_INFINITY, 20)).toBe(20)
  })
})
