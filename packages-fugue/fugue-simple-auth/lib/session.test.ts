import { describe, expect, it } from 'vitest'
import { fugueSimpleAuthDefaults } from '../types/config'
import { createSessionToken, keysMatch, verifySessionToken } from './session'

describe('keysMatch', () => {
  it('matches equal keys', () => {
    expect(keysMatch('abc', 'abc')).toBe(true)
  })

  it('rejects mismatched keys', () => {
    expect(keysMatch('abc', 'abd')).toBe(false)
  })

  it('trims whitespace', () => {
    expect(keysMatch(' abc ', 'abc')).toBe(true)
  })
})

describe('session token', () => {
  const label = 'test-authenticated'

  it('creates a verifiable token', () => {
    const token = createSessionToken('secret', label)
    expect(verifySessionToken(token, 'secret', label)).toBe(true)
  })

  it('rejects wrong access key', () => {
    const token = createSessionToken('secret', label)
    expect(verifySessionToken(token, 'other', label)).toBe(false)
  })

  it('uses session label from config contract', () => {
    const config = { ...fugueSimpleAuthDefaults, sessionLabel: 'my-site-authenticated' }
    const token = createSessionToken('k', config.sessionLabel)
    expect(verifySessionToken(token, 'k', config.sessionLabel)).toBe(true)
  })
})
