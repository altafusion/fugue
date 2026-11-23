import type { PageCollectionItemBase } from '@nuxt/content'

declare module '@nuxt/content' {
  interface PagesCollectionItem extends PageCollectionItemBase {
    layout?: 'landing' | 'article' | 'article-aside'
    nav?: {
      primary?: string
    }
  }

  interface PageCollections {
    pages: PagesCollectionItem
    pages_en: PagesCollectionItem
    pages_es: PagesCollectionItem
  }

  interface Collections {
    pages: PagesCollectionItem
    pages_en: PagesCollectionItem
    pages_es: PagesCollectionItem
    [key: `pages_${string}`]: PagesCollectionItem
  }
}

export {}
