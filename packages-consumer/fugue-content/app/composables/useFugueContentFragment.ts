import type { MaybeRefOrGetter } from 'vue'
import { fragmentContentId, fragmentContentPath } from '../../lib/i18n-utils'

export interface FugueContentFragment {
  path: string
  title?: string
  description?: string
  body?: unknown
  images?: Array<{ src: string, alt: string, span?: number }>
  [key: string]: unknown
}

/**
 * Load a Studio-editable markdown fragment for embedding in Vue product pages.
 * Fragments live in `content/{locale}/fragments/{slug}.md` — not served by the catch-all.
 */
export function useFugueContentFragment(slug: MaybeRefOrGetter<string>) {
  const nuxtApp = useNuxtApp()
  const slugValue = computed(() => toValue(slug))
  const { locale, isEnabled, fragmentsCollection, defaultLocale } = useFugueContentI18n()

  const contentPath = computed(() =>
    fragmentContentPath(slugValue.value, locale.value, defaultLocale.value)
  )

  /** Stable id for Studio click-to-edit — available before async fragment load completes. */
  const contentId = computed(() =>
    fragmentContentId(
      slugValue.value,
      locale.value,
      defaultLocale.value,
      String(fragmentsCollection.value)
    )
  )

  /** Avoid querying locale collections before @nuxtjs/i18n is mounted (dev restart / HMR). */
  const i18nReady = computed(() => !isEnabled.value || !!nuxtApp.$i18n)

  const { data: fragment, error, pending } = useAsyncData(
    () => `fugue-content-fragment:${isEnabled.value
      ? `${locale.value}:`
      : ''}${slugValue.value}`,
    () => {
      if (!i18nReady.value)
        return Promise.resolve(null)
      return queryCollection(fragmentsCollection.value).path(contentPath.value).first()
    },
    {
      watch: [
        fragmentsCollection,
        locale,
        contentPath,
        i18nReady,
        slugValue
      ]
    }
  )

  /** Keep SSR/hydrated content visible while i18n or locale refetch runs. */
  const loading = computed(
    () => !fragment.value && (pending.value || (isEnabled.value && !i18nReady.value))
  )

  return {
    fragment: computed(() => (fragment.value as FugueContentFragment | null) ?? null),
    contentId,
    error,
    loading
  }
}
