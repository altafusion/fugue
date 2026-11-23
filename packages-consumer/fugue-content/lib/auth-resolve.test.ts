import { afterEach, describe, expect, it } from 'vitest'
import { isStudioGoogleConfigured, resolveFugueContentSiteAuth } from './auth-resolve'

const studioBlock = {
  repository: {
    owner: 'altafusion',
    repo: 'altafusion-monorepo',
    rootDir: 'apps/my-site'
  },
  editors: { provider: 'google' as const }
}

const authBlock = {
  envPrefix: 'SITE',
  loginDescription: 'Enter the access key.'
}

function setEnv(name: string, value: string | undefined) {
  if (value === undefined)
    delete process.env[name]
  else
    process.env[name] = value
}

describe('isStudioGoogleConfigured', () => {
  const keys = [
    'STUDIO_GOOGLE_CLIENT_ID',
    'STUDIO_GOOGLE_CLIENT_SECRET',
    'STUDIO_GOOGLE_MODERATORS'
  ] as const

  const prev = Object.fromEntries(keys.map(key => [key, process.env[key]]))

  afterEach(() => {
    for (const key of keys)
      setEnv(key, prev[key])
  })

  it('returns true when all Google Studio env vars are set', () => {
    setEnv('STUDIO_GOOGLE_CLIENT_ID', 'id')
    setEnv('STUDIO_GOOGLE_CLIENT_SECRET', 'secret')
    setEnv('STUDIO_GOOGLE_MODERATORS', 'editor@gmail.com')

    expect(isStudioGoogleConfigured()).toBe(true)
  })

  it('returns false when any Google Studio env var is missing', () => {
    setEnv('STUDIO_GOOGLE_CLIENT_ID', 'id')
    setEnv('STUDIO_GOOGLE_CLIENT_SECRET', 'secret')
    setEnv('STUDIO_GOOGLE_MODERATORS', undefined)

    expect(isStudioGoogleConfigured()).toBe(false)
  })
})

describe('resolveFugueContentSiteAuth', () => {
  const peekKeys = ['SITE_ACCESS_KEY', 'SITE_AUTH_ENABLED'] as const
  const studioKeys = [
    'STUDIO_GOOGLE_CLIENT_ID',
    'STUDIO_GOOGLE_CLIENT_SECRET',
    'STUDIO_GOOGLE_MODERATORS'
  ] as const

  const prev = Object.fromEntries(
    [
      ...peekKeys,
      ...studioKeys
    ].map(key => [key, process.env[key]])
  )

  afterEach(() => {
    for (const key of [
      ...peekKeys,
      ...studioKeys
    ])
      setEnv(key, prev[key])
  })

  it('uses studio when manifest authMode is studio even if peek env is set', () => {
    setEnv('SITE_ACCESS_KEY', 'peek-key')
    setEnv('STUDIO_GOOGLE_CLIENT_ID', 'id')
    setEnv('STUDIO_GOOGLE_CLIENT_SECRET', 'secret')
    setEnv('STUDIO_GOOGLE_MODERATORS', 'editor@gmail.com')

    expect(resolveFugueContentSiteAuth({
      authMode: 'studio',
      auth: authBlock,
      studio: studioBlock
    })).toEqual({
      mode: 'studio',
      envPrefix: 'SITE'
    })
  })

  it('prefers studio over peek in auto mode when both env layers are configured', () => {
    setEnv('SITE_ACCESS_KEY', 'peek-key')
    setEnv('STUDIO_GOOGLE_CLIENT_ID', 'id')
    setEnv('STUDIO_GOOGLE_CLIENT_SECRET', 'secret')
    setEnv('STUDIO_GOOGLE_MODERATORS', 'editor@gmail.com')

    expect(resolveFugueContentSiteAuth({
      auth: authBlock,
      studio: studioBlock
    })).toEqual({
      mode: 'studio',
      envPrefix: 'SITE'
    })
  })

  it('uses peek in auto mode when only peek env is configured', () => {
    setEnv('SITE_ACCESS_KEY', 'peek-key')

    expect(resolveFugueContentSiteAuth({
      auth: authBlock,
      studio: studioBlock
    })).toMatchObject({
      mode: 'peek',
      envPrefix: 'SITE',
      peekConfig: authBlock
    })
  })

  it('honors manifest peek mode and ignores studio env', () => {
    setEnv('STUDIO_GOOGLE_CLIENT_ID', 'id')
    setEnv('STUDIO_GOOGLE_CLIENT_SECRET', 'secret')
    setEnv('STUDIO_GOOGLE_MODERATORS', 'editor@gmail.com')
    setEnv('SITE_ACCESS_KEY', 'peek-key')

    expect(resolveFugueContentSiteAuth({
      authMode: 'peek',
      auth: authBlock,
      studio: studioBlock
    })).toMatchObject({
      mode: 'peek',
      peekConfig: authBlock
    })
  })

  it('returns off when manifest mode is off', () => {
    setEnv('SITE_ACCESS_KEY', 'peek-key')

    expect(resolveFugueContentSiteAuth({
      authMode: 'off',
      auth: authBlock
    })).toEqual({
      mode: 'off',
      envPrefix: 'SITE'
    })
  })
})
