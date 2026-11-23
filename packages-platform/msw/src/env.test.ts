import { describe, expect, it } from 'vitest'
import { isMswEnabled } from './env'

describe('isMswEnabled', () => {
  it('returns true when msw is on and server mode is off', () => {
    expect(isMswEnabled({ mswEnabled: true })).toBe(true)
    expect(isMswEnabled({ mswEnabled: 'true' })).toBe(true)
  })

  it('returns false when server mode is on or msw is off', () => {
    expect(isMswEnabled({ mswEnabled: true, serverEnabled: true })).toBe(false)
    expect(isMswEnabled({ mswEnabled: false })).toBe(false)
    expect(isMswEnabled({})).toBe(false)
  })
})
