import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveI18nLocaleCodes } from './i18n-locales'
import {
  contentPrefixForLocale,
  fragmentContentId,
  fragmentContentPath,
  fragmentFsPath,
  fragmentsCollectionName,
  fragmentsRoutePrefix,
  normalizeLocaleCode,
  pageContentId,
  pageFsPath,
  pagesCollectionName,
  settingsCollectionName
} from './i18n-utils'

describe('fugue-content-i18n', () => {
  it('normalizes locale codes for collection names', () => {
    expect(normalizeLocaleCode('en')).toBe('en')
    expect(normalizeLocaleCode('pt-BR')).toBe('pt_BR')
    expect(pagesCollectionName('es')).toBe('pages_es')
    expect(pagesCollectionName('pt-BR')).toBe('pages_pt_BR')
  })

  it('builds content prefixes for default and secondary locales', () => {
    expect(contentPrefixForLocale('en', 'en')).toBe('/')
    expect(contentPrefixForLocale('es', 'en')).toBe('/es')
  })

  it('builds fragment collection names and content paths', () => {
    expect(fragmentsCollectionName('es')).toBe('fragments_es')
    expect(settingsCollectionName('es')).toBe('settings_es')
    expect(fragmentsRoutePrefix('en', 'en')).toBe('/fragments')
    expect(fragmentsRoutePrefix('es', 'en')).toBe('/es/fragments')
    expect(fragmentContentPath('app-demo', 'en', 'en')).toBe('/fragments/app-demo')
    expect(fragmentContentPath('app-demo', 'es', 'en')).toBe('/es/fragments/app-demo')
    expect(fragmentContentPath('/fragments/app-demo', 'en', 'en')).toBe('/fragments/app-demo')
    expect(fragmentContentId('app-demo', 'en', 'en')).toBe('fragments_en/fragments/app-demo.md')
    expect(fragmentContentId('app-demo', 'es', 'en')).toBe('fragments_es/es/fragments/app-demo.md')
    expect(fragmentContentId('app-demo', 'en', 'en', 'fragments')).toBe('fragments/fragments/app-demo.md')
    expect(fragmentFsPath('app-demo', 'en', 'en')).toBe('en/fragments/app-demo.md')
    expect(fragmentFsPath('app-demo', 'es', 'en')).toBe('es/fragments/app-demo.md')
    expect(fragmentFsPath('app-demo', 'en', 'en', false)).toBe('fragments/app-demo.md')
  })

  it('builds page filesystem paths and content ids', () => {
    expect(pageFsPath('policies', 'en', 'en')).toBe('en/policies.md')
    expect(pageFsPath('es/policies', 'es', 'en')).toBe('es/policies.md')
    expect(pageFsPath('about', 'en', 'en', false)).toBe('about.md')
    expect(pageContentId('policies', 'en', 'en')).toBe('pages_en/en/policies.md')
    expect(pageContentId('es/policies', 'es', 'en')).toBe('pages_es/es/policies.md')
  })

  it('filters locales to those with content folders', () => {
    const root = mkdtempSync(join(tmpdir(), 'fugue-content-i18n-'))
    mkdirSync(join(root, 'content', 'en'), { recursive: true })
    mkdirSync(join(root, 'content', 'es'), { recursive: true })

    const codes = resolveI18nLocaleCodes(root, [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' }
    ])

    expect(codes).toEqual(['en', 'es'])
    rmSync(root, { recursive: true, force: true })
  })
})
