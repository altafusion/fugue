import type { Collections } from '@nuxt/content'
import { fragmentsCollectionName, pagesCollectionName, settingsCollectionName } from '../../lib/i18n-utils'

export interface FugueContentPublicConfig {
  i18nEnabled?: boolean
  defaultLocale?: string
  filteredLocales?: Array<{ code: string, name?: string }>
}

export function useFugueContentI18n() {
  const fugueContentConfig = useRuntimeConfig().public.cms as FugueContentPublicConfig | undefined
  const nuxtApp = useNuxtApp()

  const isEnabled = computed(() => !!fugueContentConfig?.i18nEnabled)

  const locale = computed(() => {
    if (!isEnabled.value)
      return fugueContentConfig?.defaultLocale ?? 'en'
    const i18n = nuxtApp.$i18n as { locale: { value: string } } | undefined
    return i18n?.locale?.value ?? fugueContentConfig?.defaultLocale ?? 'en'
  })

  const locales = computed(() => fugueContentConfig?.filteredLocales ?? [])

  const pagesCollection = computed((): keyof Collections => {
    const code = locale.value
    if (!isEnabled.value)
      return pagesCollectionName(fugueContentConfig?.defaultLocale ?? 'en') as keyof Collections
    return pagesCollectionName(code) as keyof Collections
  })

  const fragmentsCollection = computed((): keyof Collections => {
    const code = locale.value
    if (!isEnabled.value)
      return fragmentsCollectionName(fugueContentConfig?.defaultLocale ?? 'en') as keyof Collections
    return fragmentsCollectionName(code) as keyof Collections
  })

  const settingsCollection = computed((): keyof Collections => {
    const code = locale.value
    if (!isEnabled.value)
      return settingsCollectionName(fugueContentConfig?.defaultLocale ?? 'en') as keyof Collections
    return settingsCollectionName(code) as keyof Collections
  })

  const defaultLocale = computed(() => fugueContentConfig?.defaultLocale ?? 'en')

  function localePath(path: string) {
    if (!isEnabled.value)
      return path
    const fn = nuxtApp.$localePath as ((target: string) => string) | undefined
    return fn?.(path) ?? path
  }

  function switchLocalePath(target: string) {
    const fn = nuxtApp.$switchLocalePath as ((_locale: string) => string) | undefined
    return fn?.(target) ?? `/${target}`
  }

  function t(key: string) {
    const i18n = nuxtApp.$i18n as { t: (_key: string) => string } | undefined
    return i18n?.t(key) ?? key
  }

  return {
    isEnabled,
    locale,
    locales,
    defaultLocale,
    pagesCollection,
    fragmentsCollection,
    settingsCollection,
    localePath,
    switchLocalePath,
    t
  }
}
