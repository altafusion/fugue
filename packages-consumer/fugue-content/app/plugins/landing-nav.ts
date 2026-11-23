import { landingNavItems } from '../../lib/landing'

/**
 * When `settings/site.yml` defines `landing.sections` with `nav`, register shell header links.
 * Overrides `runtimeConfig.public.appNav` via `setAppNavItems`.
 */
export default defineNuxtPlugin(() => {
  const { settings } = useFugueContentSettings()
  const { locale, isEnabled } = useFugueContentI18n()
  const { localePath } = useShellI18n()

  function syncNav() {
    const items = landingNavItems(settings.value?.landing?.sections, localePath)
    if (items.length)
      setAppNavItems(items)
  }

  watch(
    [
      () => settings.value?.landing?.sections,
      () => (isEnabled.value ? locale.value : null)
    ],
    syncNav,
    { immediate: true, deep: true }
  )
})
