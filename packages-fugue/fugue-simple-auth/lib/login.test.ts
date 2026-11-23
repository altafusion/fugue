import { describe, expect, it } from 'vitest'
import { normalizeAuthGateLoginRedirect, resolveSimpleAuthRedirect, shouldClearStaleAuthSession, shouldShowSimpleAuthLogin, shouldShowSimpleAuthSignOut } from './login'

describe('normalizeAuthGateLoginRedirect', () => {
  it('unwraps /_studio inner redirect to a public page', () => {
    expect(normalizeAuthGateLoginRedirect('/_studio?redirect=%2Fabout')).toBe('/about')
  })

  it('falls back when /_studio has no inner redirect', () => {
    expect(normalizeAuthGateLoginRedirect('/_studio', '/')).toBe('/')
  })

  it('leaves normal paths unchanged', () => {
    expect(normalizeAuthGateLoginRedirect('/about')).toBe('/about')
  })

  it('normalizes /__nuxt_studio paths to fallback', () => {
    expect(normalizeAuthGateLoginRedirect('/__nuxt_studio/auth/google', '/')).toBe('/')
  })
})

describe('resolveSimpleAuthRedirect', () => {
  it('uses safe in-app redirect query', () => {
    expect(resolveSimpleAuthRedirect('/organizer', '/')).toBe('/organizer')
  })

  it('unwraps /_studio redirect targets', () => {
    expect(resolveSimpleAuthRedirect('/_studio?redirect=/', '/')).toBe('/')
  })

  it('rejects external redirect query', () => {
    expect(resolveSimpleAuthRedirect('https://evil.test', '/organizer')).toBe('/organizer')
  })

  it('falls back when query missing', () => {
    expect(resolveSimpleAuthRedirect(undefined, '/organizer')).toBe('/organizer')
  })
})

describe('shouldShowSimpleAuthLogin', () => {
  it('shows when auth required and user is anonymous', () => {
    expect(shouldShowSimpleAuthLogin({ required: true, authenticated: false })).toBe(true)
  })

  it('hides when auth off or already signed in', () => {
    expect(shouldShowSimpleAuthLogin({ required: false, authenticated: false })).toBe(false)
    expect(shouldShowSimpleAuthLogin({ required: true, authenticated: true })).toBe(false)
  })
})

describe('shouldShowSimpleAuthSignOut', () => {
  it('shows when auth required and user is signed in', () => {
    expect(shouldShowSimpleAuthSignOut({ required: true, authenticated: true })).toBe(true)
  })

  it('hides when auth off or anonymous', () => {
    expect(shouldShowSimpleAuthSignOut({ required: false, authenticated: true })).toBe(false)
    expect(shouldShowSimpleAuthSignOut({ required: true, authenticated: false })).toBe(false)
  })
})

describe('shouldClearStaleAuthSession', () => {
  it('clears when gate is off at runtime (legacy cookie)', () => {
    expect(shouldClearStaleAuthSession({ required: false, authenticated: true })).toBe(true)
  })

  it('clears when gate is on but session is anonymous or invalid', () => {
    expect(shouldClearStaleAuthSession({ required: true, authenticated: false })).toBe(true)
  })

  it('keeps active peek sessions', () => {
    expect(shouldClearStaleAuthSession({ required: true, authenticated: true })).toBe(false)
  })

  it('ignores missing session payload', () => {
    expect(shouldClearStaleAuthSession(null)).toBe(false)
  })
})
