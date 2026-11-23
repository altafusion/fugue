export interface FugueContentPage {
  path: string
  stem?: string
  title?: string
  description?: string
  layout?: 'landing' | 'article' | 'article-aside'
  nav?: {
    primary?: string
  }
  body?: unknown
  [key: string]: unknown
}

export type FugueContentLayoutName = 'landing' | 'article' | 'article-aside'

const fugueContentPageKey = 'cms:page'

/**
 * Holds the active content page for the current route (set by content route pages).
 */
export function useFugueContentPage() {
  const page = useState<FugueContentPage | null>(fugueContentPageKey, () => null)

  const layout = computed((): FugueContentLayoutName => {
    const value = page.value?.layout
    if (value === 'article-aside')
      return 'article-aside'
    if (value === 'article')
      return 'article'
    return 'landing'
  })

  return {
    page,
    layout
  }
}
