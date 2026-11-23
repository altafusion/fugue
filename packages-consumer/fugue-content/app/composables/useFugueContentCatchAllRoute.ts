import type { FugueContentPage } from './useFugueContentPage'
import { FUGUE_CONTENT_404_DEFAULTS, isFugueContent404, resolveFugueContent404Copy } from '../../lib/404-defaults'

export function useFugueContentCatchAllRoute() {
  const route = useRoute()
  const nuxtApp = useNuxtApp()
  const { page } = useFugueContentPage()
  const { locale, isEnabled, pagesCollection } = useFugueContentI18n()

  const contentPath = computed(() => route.path || '/')

  /** Avoid querying locale collections before @nuxtjs/i18n is mounted (dev restart / HMR). */
  const i18nReady = computed(() => !isEnabled.value || !!nuxtApp.$i18n)

  const { data: contentPage, error, pending } = useAsyncData<FugueContentPage | null>(
    () => `fugue-content-page:${isEnabled.value
      ? `${locale.value}:`
      : ''}${contentPath.value}`,
    async () => {
      if (!i18nReady.value)
        return null
      const result = await queryCollection(pagesCollection.value).path(contentPath.value).first()
      return (result as FugueContentPage | null) ?? null
    },
    {
      watch: [
        pagesCollection,
        locale,
        contentPath,
        i18nReady
      ]
    }
  )

  const loading = computed(() => pending.value || (isEnabled.value && !i18nReady.value))

  const { t } = useShellI18n()

  const notFound = computed(() => isFugueContent404({
    loading: loading.value,
    error: error.value,
    contentPage: contentPage.value,
    i18nReady: i18nReady.value
  }))

  const notFoundCopy = computed(() => resolveFugueContent404Copy(t))

  useFugueContentSiteSeo({
    title: () => contentPage.value?.title ?? (notFound.value ? notFoundCopy.value.title : undefined),
    description: () => contentPage.value?.description ?? (notFound.value ? notFoundCopy.value.description : undefined)
  })

  watch(notFound, (value) => {
    if (value && import.meta.server) {
      const event = useRequestEvent()
      if (event)
        setResponseStatus(event, FUGUE_CONTENT_404_DEFAULTS.statusCode)
    }
  }, { immediate: true })

  watch(
    contentPage,
    (fugueContentPage) => {
      page.value = fugueContentPage ?? null

      if (!fugueContentPage)
        return

      if (fugueContentPage.nav?.primary) {
        route.meta.nav = {
          ...(typeof route.meta.nav === 'object' && route.meta.nav
            ? route.meta.nav
            : {}),
          primary: fugueContentPage.nav.primary
        }
      }

      if (fugueContentPage.layout === 'article' && fugueContentPage.title)
        route.meta.title = fugueContentPage.title
      else
        delete route.meta.title
    },
    { immediate: true }
  )

  return {
    contentPage,
    error,
    loading
  }
}
