/**
 * Syncs fugue-theme light/dark (`useTheme` / `fugue:theme`) with `[data-theme]` and
 * `@nuxtjs/color-mode` when present — not Altafusion runtime brand (`useBrandTheme`).
 */
export default defineNuxtPlugin(() => {
  const { theme } = useTheme()

  // When @nuxtjs/color-mode is present (Docus, Nuxt UI apps), sync our state with it.
  // color-mode will set data-theme when configured with colorMode.dataValue: 'theme'.
  let colorMode: ReturnType<typeof useColorMode> | undefined
  try {
    colorMode = useColorMode()
  } catch {
    colorMode = undefined
  }
  if (colorMode) {
    watch(
      () => colorMode.value,
      (val) => {
        theme.value = val as 'light' | 'dark'
      },
      { immediate: true },
    )
    watch(() => theme.value, (val) => {
      if (colorMode.value !== val)
        colorMode.preference = val
    })
    return
  }

  // Fallback: set data-theme ourselves (apps without color-mode)
  watchEffect(() => {
    if (typeof document !== 'undefined')
      document.documentElement.setAttribute('data-theme', theme.value)
  })
})
