import { describe, expect, it } from 'vitest'
import {
  FUGUE_CONTENT_STUDIO_DEV_USER,
  hasFugueContentStudioSession,
  normalizeFugueContentStudioUser,
  resolveFugueContentStudioUser
} from './studio-session'

describe('resolveFugueContentStudioUser', () => {
  it('prefers session user over dev user', () => {
    expect(resolveFugueContentStudioUser(
      {
        user: { email: 'a@example.com', picture: 'https://example.com/a.png' }
      },
      FUGUE_CONTENT_STUDIO_DEV_USER
    )).toMatchObject({
      email: 'a@example.com',
      avatar: 'https://example.com/a.png'
    })
  })

  it('falls back to dev user when session is empty', () => {
    expect(resolveFugueContentStudioUser(null, FUGUE_CONTENT_STUDIO_DEV_USER)).toMatchObject({
      email: 'dev@nuxt.com'
    })
  })

  it('restores dev user from dev auth cookie after refresh', () => {
    expect(resolveFugueContentStudioUser(null, null, {
      devAuthCheck: 'true',
      isDev: true
    })).toMatchObject({
      email: 'dev@nuxt.com',
      name: 'Dev'
    })
  })
})

describe('normalizeFugueContentStudioUser', () => {
  it('maps Google picture to avatar', () => {
    expect(normalizeFugueContentStudioUser({
      email: 'a@example.com',
      picture: 'https://example.com/a.png'
    })).toMatchObject({
      avatar: 'https://example.com/a.png'
    })
  })

  it('omits empty avatar values', () => {
    expect(normalizeFugueContentStudioUser({
      email: 'a@example.com',
      avatar: ''
    })).toEqual({
      email: 'a@example.com',
      name: undefined
    })
  })
})

describe('hasFugueContentStudioSession', () => {
  it('treats the prod session cookie as authenticated', () => {
    expect(hasFugueContentStudioSession('true', null)).toBe(true)
    expect(hasFugueContentStudioSession(null, {
      user: { email: 'a@example.com' }
    })).toBe(false)
  })

  it('uses dev auth cookie without studio-session-check', () => {
    expect(hasFugueContentStudioSession(null, null, null, true, 'true')).toBe(true)
  })

  it('allows dev user before cookie is written', () => {
    expect(hasFugueContentStudioSession(
      null,
      null,
      FUGUE_CONTENT_STUDIO_DEV_USER,
      true
    )).toBe(true)
  })
})
