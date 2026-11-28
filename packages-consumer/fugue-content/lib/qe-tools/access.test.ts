import { describe, expect, it } from 'vitest'
import { canUsePrivilegedDevTools } from './access'

describe('canUsePrivilegedDevTools', () => {
  it('allows everyone in development', () => {
    expect(canUsePrivilegedDevTools(true, undefined)).toBe(true)
  })

  it('allows a signed-in editor in production when useCookie returns the boolean true', () => {
    expect(canUsePrivilegedDevTools(false, true)).toBe(true)
  })

  it('allows a signed-in editor in production when the cookie value is the string true', () => {
    expect(canUsePrivilegedDevTools(false, 'true')).toBe(true)
  })

  it('hides it in production without the cookie, or with another value', () => {
    expect(canUsePrivilegedDevTools(false, undefined)).toBe(false)
    expect(canUsePrivilegedDevTools(false, null)).toBe(false)
    expect(canUsePrivilegedDevTools(false, false)).toBe(false)
    expect(canUsePrivilegedDevTools(false, 'false')).toBe(false)
  })
})
