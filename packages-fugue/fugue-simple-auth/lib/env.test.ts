import { describe, expect, it } from 'vitest'
import { accessKeyEnvName, authEnabledEnvName, isAuthEnabledAtBuild, parseEnvValue } from './env'

describe('parseEnvValue', () => {
  it('strips double quotes', () => {
    expect(parseEnvValue('"secret"')).toBe('secret')
  })

  it('strips single quotes', () => {
    expect(parseEnvValue('\'secret\'')).toBe('secret')
  })
})

describe('env var names', () => {
  it('builds access key env name from prefix', () => {
    expect(accessKeyEnvName('MY_SITE')).toBe('MY_SITE_ACCESS_KEY')
  })

  it('builds auth enabled env name from prefix', () => {
    expect(authEnabledEnvName('MY_SITE')).toBe('MY_SITE_AUTH_ENABLED')
  })
})

describe('isAuthEnabledAtBuild', () => {
  it('returns true when AUTH_ENABLED is true', () => {
    expect(isAuthEnabledAtBuild('MY_SITE')).toBe(false)
    process.env.MY_SITE_AUTH_ENABLED = 'true'
    expect(isAuthEnabledAtBuild('MY_SITE')).toBe(true)
    delete process.env.MY_SITE_AUTH_ENABLED
  })

  it('returns true when access key is non-empty', () => {
    process.env.MY_SITE_ACCESS_KEY = 'x'
    expect(isAuthEnabledAtBuild('MY_SITE')).toBe(true)
    delete process.env.MY_SITE_ACCESS_KEY
  })
})
