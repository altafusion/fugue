import { describe, expect, it } from 'vitest'
import { FUGUE_CONTENT_404_DEFAULTS, isFugueContent404, resolveFugueContent404Copy } from './404-defaults'

describe('isFugueContent404', () => {
  it('returns true when content is missing after load', () => {
    expect(isFugueContent404({
      loading: false,
      error: null,
      contentPage: null,
      i18nReady: true
    })).toBe(true)
  })

  it('returns false while loading or waiting for i18n', () => {
    expect(isFugueContent404({
      loading: true,
      error: null,
      contentPage: null,
      i18nReady: true
    })).toBe(false)

    expect(isFugueContent404({
      loading: false,
      error: null,
      contentPage: null,
      i18nReady: false
    })).toBe(false)
  })

  it('returns false when content exists or query failed', () => {
    expect(isFugueContent404({
      loading: false,
      error: null,
      contentPage: { title: 'About' },
      i18nReady: true
    })).toBe(false)

    expect(isFugueContent404({
      loading: false,
      error: new Error('query failed'),
      contentPage: null,
      i18nReady: true
    })).toBe(false)
  })
})

describe('fUGUE_CONTENT_404_DEFAULTS', () => {
  it('uses a 404 status code and home action', () => {
    expect(FUGUE_CONTENT_404_DEFAULTS.statusCode).toBe(404)
    expect(FUGUE_CONTENT_404_DEFAULTS.actionTo).toBe('/')
  })
})

describe('resolveFugueContent404Copy', () => {
  it('falls back to English defaults when keys are missing', () => {
    expect(resolveFugueContent404Copy((_key, fallback) => fallback)).toEqual({
      title: FUGUE_CONTENT_404_DEFAULTS.title,
      description: FUGUE_CONTENT_404_DEFAULTS.description,
      actionLabel: FUGUE_CONTENT_404_DEFAULTS.actionLabel
    })
  })

  it('uses translated strings when t returns them', () => {
    const t = (key: string, fallback: string) => {
      if (key === 'fugueContent404.title')
        return 'Página No Encontrada'
      return fallback
    }

    expect(resolveFugueContent404Copy(t).title).toBe('Página No Encontrada')
    expect(resolveFugueContent404Copy(t).description).toBe(FUGUE_CONTENT_404_DEFAULTS.description)
  })
})
