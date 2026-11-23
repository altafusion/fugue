import type { Collections } from '@nuxt/content'
import type { MaybeRefOrGetter } from 'vue'
import type { FugueContentLandingManifest } from '../../lib/landing'
import { settingsCollectionName } from '../../lib/i18n-utils'

export interface FugueContentSettingsAddress {
  street?: string
  city?: string
  region?: string
  postalCode?: string
  country?: string
}

export interface FugueContentSettingsSeo {
  title?: string
  description?: string
  titleTemplate?: string
  ogImage?: string
  twitterCard?: 'summary' | 'summary_large_image'
}

export interface FugueContentSettingsTheme {
  /** Dark canvas personality — overrides `sitePalette.darkCanvas` when set. */
  darkCanvas?: 'gray' | 'black'
}

export interface FugueContentSettings {
  siteName?: string
  phone?: string
  email?: string
  address?: FugueContentSettingsAddress
  hours?: string
  mapEmbedUrl?: string
  social?: {
    instagram?: string
    facebook?: string
  }
  seo?: FugueContentSettingsSeo
  landing?: FugueContentLandingManifest
  theme?: FugueContentSettingsTheme
}

export function useFugueContentSettings() {
  const nuxtApp = useNuxtApp()
  const { locale, isEnabled, defaultLocale } = useFugueContentI18n()

  const settingsCollection = computed((): keyof Collections => {
    if (!isEnabled.value)
      return settingsCollectionName(defaultLocale.value) as keyof Collections
    return settingsCollectionName(locale.value) as keyof Collections
  })

  const i18nReady = computed(() => !isEnabled.value || !!nuxtApp.$i18n)

  const { data: settings, pending, error } = useAsyncData(
    () => `fugue-content-settings:${isEnabled.value
      ? `${locale.value}:`
      : ''}${defaultLocale.value}`,
    () => {
      if (!i18nReady.value)
        return Promise.resolve(null)
      return queryCollection(settingsCollection.value).first()
    },
    {
      watch: [settingsCollection, locale, i18nReady]
    }
  )

  return {
    settings: computed(() => (settings.value as FugueContentSettings | null) ?? null),
    pending,
    error
  }
}

export interface FugueContentSeoOverrides {
  title?: MaybeRefOrGetter<string | undefined>
  description?: MaybeRefOrGetter<string | undefined>
}

function resolveAssetUrl(path: string | undefined, origin: string) {
  if (!path)
    return undefined
  if (path.startsWith('http://') || path.startsWith('https://'))
    return path
  return `${origin}${path.startsWith('/')
    ? path
    : `/${path}`}`
}

/**
 * Site-wide and per-page SEO — merges Content `settings`, app `seo` config, and overrides.
 */
export function useFugueContentSiteSeo(overrides: FugueContentSeoOverrides = {}) {
  const appConfig = useAppConfig() as { seo?: FugueContentSettingsSeo }
  const { settings } = useFugueContentSettings()
  const requestURL = useRequestURL()

  const resolved = computed(() => {
    const fromSettings = settings.value?.seo
    const fromApp = appConfig.seo
    const pageTitle = toValue(overrides.title)
    const pageDescription = toValue(overrides.description)

    const siteTitle = fromSettings?.title ?? fromApp?.title
    const siteDescription = fromSettings?.description ?? fromApp?.description
    const titleTemplate = fromSettings?.titleTemplate ?? fromApp?.titleTemplate
    const ogImage = fromSettings?.ogImage ?? fromApp?.ogImage ?? '/favicon.svg'
    const twitterCard = fromSettings?.twitterCard ?? fromApp?.twitterCard ?? 'summary_large_image'

    const title = pageTitle ?? siteTitle
    const description = pageDescription ?? siteDescription
    const ogImageUrl = resolveAssetUrl(ogImage, requestURL.origin)

    return {
      title,
      description,
      titleTemplate,
      ogImageUrl,
      twitterCard,
      ogUrl: requestURL.href
    }
  })

  useSeoMeta({
    title: () => resolved.value.title,
    description: () => resolved.value.description,
    titleTemplate: () => resolved.value.titleTemplate ?? null,
    ogTitle: () => resolved.value.title,
    ogDescription: () => resolved.value.description,
    ogImage: () => resolved.value.ogImageUrl,
    ogUrl: () => resolved.value.ogUrl,
    twitterCard: () => resolved.value.twitterCard,
    twitterTitle: () => resolved.value.title,
    twitterDescription: () => resolved.value.description,
    twitterImage: () => resolved.value.ogImageUrl
  })

  return { resolved }
}
