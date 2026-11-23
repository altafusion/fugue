import { shellDisplayNameKey } from '@altafusion/shell/lib/injection-keys'

/**
 * Wire `settings.site.yml` → `siteName` into shell header title (see Settings & Metadata doc).
 * Logo/favicon remain developer-owned in `app.config.ts` `brand`.
 *
 * Uses `vueApp.provide` on `app:created` — Nuxt plugin `setup()` is not a Vue component setup,
 * so calling `provide()` there triggers SSR warnings.
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:created', (vueApp) => {
    nuxtApp.runWithContext(() => {
      const { settings } = useFugueContentSettings()
      const displayName = computed(() => settings.value?.siteName)
      vueApp.provide(shellDisplayNameKey, displayName)
    })
  })
})
