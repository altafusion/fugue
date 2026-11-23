export interface FugueContentLocaleEntry {
  code: string
  name?: string
}

export interface ShellFugueContentPublicConfig {
  i18nEnabled?: boolean
  defaultLocale?: string
  filteredLocales?: FugueContentLocaleEntry[]
}

function isFugueContentLocaleEntry(value: unknown): value is FugueContentLocaleEntry {
  return typeof value === 'object'
    && value !== null
    && typeof (value as FugueContentLocaleEntry).code === 'string'
}

export function normalizeFugueContentLocales(value: unknown): FugueContentLocaleEntry[] {
  if (!Array.isArray(value))
    return []
  return value.filter(isFugueContentLocaleEntry)
}

/** Read `runtimeConfig.public.cms` with normalized locale entries. */
export function useShellFugueContentPublicConfig(): ShellFugueContentPublicConfig | undefined {
  const cms = useRuntimeConfig().public.cms
  if (!cms || typeof cms !== 'object')
    return undefined

  const record = cms as Record<string, unknown>

  return {
    i18nEnabled: record.i18nEnabled === true,
    defaultLocale: typeof record.defaultLocale === 'string'
      ? record.defaultLocale
      : undefined,
    filteredLocales: normalizeFugueContentLocales(record.filteredLocales)
  }
}
