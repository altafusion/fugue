import * as nuxtUiLocales from '@nuxt/ui/locale'

/**
 * Map a BCP 47 / Docus locale code to the matching `@nuxt/ui` locale bundle.
 * Lives in `@altafusion/fugue-nuxt-ui` so apps auto-import without a direct `@nuxt/ui` dependency;
 * `@altafusion/fugue-theme` stays CSS/theme-focused.
 */
export function useNuxtUiLocale(locale: MaybeRefOrGetter<string>) {
  const nuxtUiLocale = computed(
    () =>
      nuxtUiLocales[toValue(locale) as keyof typeof nuxtUiLocales]
      || nuxtUiLocales.en,
  )
  const lang = computed(() => nuxtUiLocale.value.code)
  const dir = computed(() => nuxtUiLocale.value.dir)

  return { nuxtUiLocale, lang, dir }
}
