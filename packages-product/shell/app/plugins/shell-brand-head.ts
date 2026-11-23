import type { ShellAppConfig } from '../../types/app-brand'

/**
 * Default favicon + SEO from `app.config` brand/seo blocks.
 */
export default defineNuxtPlugin(() => {
  const { brand, seo } = useAppConfig() as ShellAppConfig

  if (brand?.favicon) {
    useHead({
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: brand.favicon }
      ]
    })
  }

  if (seo?.title || seo?.description || seo?.titleTemplate) {
    useSeoMeta({
      ...(seo.title
        ? { title: seo.title }
        : {}),
      ...(seo.description
        ? { description: seo.description }
        : {}),
      ...(seo.titleTemplate
        ? { titleTemplate: seo.titleTemplate }
        : {})
    })
  }
})
