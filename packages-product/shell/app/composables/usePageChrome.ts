export interface PageChromeBreadcrumb {
  label: string
  to?: string
}

/**
 * Page heading and breadcrumbs from route meta.
 * Reads `definePageMeta` hints (`title`, `breadcrumb`).
 */
export function usePageChrome() {
  const route = useRoute()

  const title = computed(() => {
    const metaTitle = route.meta.title
    if (typeof metaTitle === 'string')
      return metaTitle
    return undefined
  })

  const breadcrumbs = computed((): PageChromeBreadcrumb[] => {
    const crumb = route.meta.breadcrumb
    if (typeof crumb === 'string' && crumb.length > 0) {
      return [
        { label: crumb }
      ]
    }
    return []
  })

  const showAside = computed(() => {
    const nav = route.meta.nav as { aside?: string[] } | undefined
    return Boolean(nav?.aside?.length)
  })

  return {
    title,
    breadcrumbs,
    showAside
  }
}
