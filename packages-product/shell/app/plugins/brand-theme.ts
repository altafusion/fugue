/**
 * brand-theme.ts – shell layer plugin.
 *
 * Syncs cookie-backed brand to `html[data-brand]` and Nuxt UI primary scale (SSR + client).
 */
import { resolveBrandMeta } from '@altafusion/fugue-ui/utils/brandTheme'
import { ALTAFUSION_BRAND_THEME } from '../../utils/altafusionBrandTheme'

export default defineNuxtPlugin(() => {
  const { brand } = useBrandTheme()
  const appConfig = useAppConfig()

  const brandMeta = computed(() => resolveBrandMeta(ALTAFUSION_BRAND_THEME, brand.value))

  useHead({
    htmlAttrs: {
      'data-brand': computed(() => brandMeta.value.id)
    }
  })

  watch(
    brandMeta,
    (meta) => {
      if (appConfig.ui?.colors)
        appConfig.ui.colors.primary = meta.primary
    },
    { immediate: true }
  )
})
