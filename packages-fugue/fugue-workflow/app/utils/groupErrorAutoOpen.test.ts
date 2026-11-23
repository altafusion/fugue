import { describe, expect, it } from 'vitest'
import { applyGroupErrorAutoOpen } from './groupErrorAutoOpen'

describe('applyGroupErrorAutoOpen', () => {
  it('opens a collapsed group on a rising error edge', () => {
    const result = applyGroupErrorAutoOpen(
      [
        { id: 'runtime', collapsed: true, hasError: true },
      ],
      {},
      {},
    )

    expect(result.openById).toEqual({ runtime: true })
    expect(result.hadErrorById).toEqual({ runtime: true })
  })

  it('keeps a user-collapsed group closed while the same error persists', () => {
    const result = applyGroupErrorAutoOpen(
      [
        { id: 'runtime', collapsed: true, hasError: true },
      ],
      { runtime: false },
      { runtime: true },
    )

    expect(result.openById).toEqual({ runtime: false })
    expect(result.hadErrorById).toEqual({ runtime: true })
  })

  it('does not change open state when errors clear', () => {
    const result = applyGroupErrorAutoOpen(
      [
        { id: 'runtime', collapsed: true, hasError: false },
      ],
      { runtime: true },
      { runtime: true },
    )

    expect(result.openById).toEqual({ runtime: true })
    expect(result.hadErrorById).toEqual({ runtime: false })
  })

  it('opens again when an error reappears after clearing', () => {
    const result = applyGroupErrorAutoOpen(
      [
        { id: 'runtime', collapsed: true, hasError: true },
      ],
      { runtime: false },
      { runtime: false },
    )

    expect(result.openById).toEqual({ runtime: true })
    expect(result.hadErrorById).toEqual({ runtime: true })
  })

  it('does not write openById for non-collapsed groups', () => {
    const openById = { other: true }
    const hadErrorById = { other: false }

    const result = applyGroupErrorAutoOpen(
      [
        { id: 'details', collapsed: false, hasError: true },
      ],
      openById,
      hadErrorById,
    )

    expect(result.openById).toBe(openById)
    expect(result.hadErrorById).toEqual({ other: false, details: true })
  })

  it('preserves openById reference when group is already open on new error', () => {
    const openById = { runtime: true }
    const hadErrorById = {}

    const result = applyGroupErrorAutoOpen(
      [
        { id: 'runtime', collapsed: true, hasError: true },
      ],
      openById,
      hadErrorById,
    )

    expect(result.openById).toBe(openById)
    expect(result.hadErrorById).toEqual({ runtime: true })
  })

  it('preserves hadErrorById reference on first render with no error', () => {
    const openById = {}
    const hadErrorById = {}

    const result = applyGroupErrorAutoOpen(
      [
        { id: 'runtime', collapsed: true, hasError: false },
      ],
      openById,
      hadErrorById,
    )

    expect(result.openById).toBe(openById)
    expect(result.hadErrorById).toBe(hadErrorById)
  })
})
