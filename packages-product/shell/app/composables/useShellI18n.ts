import { useShellFugueContentPublicConfig } from '../../lib/fugue-content-public-config'

/** Locale helpers for shell chrome when `@nuxtjs/i18n` is enabled via `@altafusion/fugue-content`. */
export function useShellI18n() {
  const cms = useShellFugueContentPublicConfig()
  const nuxtApp = useNuxtApp()
  const isEnabled = computed(() => !!cms?.i18nEnabled)

  function localePath(path: string) {
    if (!isEnabled.value)
      return path
    const fn = nuxtApp.$localePath as ((target: string) => string) | undefined
    return fn?.(path) ?? path
  }

  function t(key: string, fallback: string) {
    if (!isEnabled.value || !key)
      return fallback
    const i18n = nuxtApp.$i18n as { t?: (messageKey: string) => string } | undefined
    const translated = i18n?.t?.(key)
    return translated && translated !== key
      ? translated
      : fallback
  }

  return {
    isEnabled,
    localePath,
    t
  }
}
