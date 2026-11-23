export type FugueContentI18nLocale = string | { code: string, name?: string }

/** Subset of `nuxt.config` i18n used by fugue-content-site content collections and fugue-content i18n module. */
export interface FugueContentNuxtI18nOptions {
  defaultLocale?: string
  locales?: FugueContentI18nLocale[]
  strategy?: string
  detectBrowserLanguage?: Record<string, unknown>
}

/** Nuxt options read by `content.config.ts` — explicit typing avoids fragile schema merges in the IDE. */
export interface FugueContentContentNuxtOptions {
  rootDir: string
  i18n?: FugueContentNuxtI18nOptions
}

export function fugueContentNuxtOptions(options: unknown): FugueContentContentNuxtOptions {
  return options as FugueContentContentNuxtOptions
}

/** Collection suffix: `pt-BR` → `pt_BR` (Docus convention). */
export function normalizeLocaleCode(code: string): string {
  return code.replace(/-/g, '_')
}

export function pagesCollectionName(localeCode: string): string {
  return `pages_${normalizeLocaleCode(localeCode)}`
}

export function fragmentsCollectionName(localeCode: string): string {
  return `fragments_${normalizeLocaleCode(localeCode)}`
}

export function settingsCollectionName(localeCode: string): string {
  return `settings_${normalizeLocaleCode(localeCode)}`
}

/**
 * Content path for a fragment slug in the active locale.
 * Slug is the file stem — e.g. `app-demo` → `/fragments/app-demo` or `/es/fragments/app-demo`.
 */
export function fragmentContentPath(slug: string, localeCode: string, defaultLocale: string): string {
  const normalized = slug.replace(/^\//, '').replace(/^fragments\//, '')
  return `${fragmentsRoutePrefix(localeCode, defaultLocale)}/${normalized}`
}

/**
 * Nuxt Content document id for a fragment — matches Studio `data-content-id` / `detectActives`.
 * Derivable from slug + locale without querying the collection (SSR-safe for Studio).
 */
export function fragmentContentId(
  slug: string,
  localeCode: string,
  defaultLocale: string,
  collectionName = fragmentsCollectionName(localeCode)
): string {
  const path = fragmentContentPath(slug, localeCode, defaultLocale).replace(/^\//, '')
  return `${collectionName}/${path}.md`
}

/** Filesystem path Studio uses in the content tree — e.g. `en/fragments/app-demo.md`. */
export function fragmentFsPath(
  slug: string,
  localeCode: string,
  _defaultLocale: string,
  hasI18n = true
): string {
  const normalized = slug.replace(/^\//, '').replace(/^fragments\//, '').replace(/\.md$/, '')
  if (!hasI18n)
    return `fragments/${normalized}.md`
  return `${localeCode}/fragments/${normalized}.md`
}

/**
 * Filesystem path Studio uses for a routed page — e.g. `en/policies.md`.
 * `stem` comes from Nuxt Content (`policies` or `es/policies` for secondary locales).
 */
export function pageFsPath(
  stem: string,
  localeCode: string,
  _defaultLocale: string,
  hasI18n = true
): string {
  const normalized = stem.replace(/^\//, '').replace(/\.md$/, '')
  if (!hasI18n)
    return `${normalized}.md`
  if (normalized.startsWith(`${localeCode}/`))
    return `${normalized}.md`
  return `${localeCode}/${normalized}.md`
}

/** Nuxt Content document id for a page — matches Studio `data-content-id`. */
export function pageContentId(
  stem: string,
  localeCode: string,
  defaultLocale: string,
  hasI18n = true,
  collectionName = pagesCollectionName(localeCode)
): string {
  return `${collectionName}/${pageFsPath(stem, localeCode, defaultLocale, hasI18n)}`
}

export function localeCodeFromEntry(locale: FugueContentI18nLocale): string {
  return typeof locale === 'string'
    ? locale
    : locale.code
}

export function localeNameFromEntry(locale: FugueContentI18nLocale): string {
  return typeof locale === 'string'
    ? locale
    : (locale.name ?? locale.code)
}

export function getDefaultI18nOptions(defaultLocale: string) {
  return {
    strategy: 'prefix_except_default' as const,
    defaultLocale,
    /** Off by default — `/` stays default locale; use header **Español** or `/es`. Opt in via `detectBrowserLanguage` in app `i18n` config. */
    detectBrowserLanguage: false as const
  }
}

export function contentPrefixForLocale(localeCode: string, defaultLocale: string): string {
  return localeCode === defaultLocale
    ? '/'
    : `/${localeCode}`
}

/** Route prefix for fragment collections — avoids `//fragments` when locale prefix is `/`. */
export function fragmentsRoutePrefix(localeCode: string, defaultLocale: string): string {
  const localePrefix = contentPrefixForLocale(localeCode, defaultLocale)
  if (localePrefix === '/')
    return '/fragments'
  return `${localePrefix}/fragments`
}
