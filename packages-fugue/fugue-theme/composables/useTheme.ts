/**
 * Light/dark appearance for the fugue-theme layer (`fugue:theme` state).
 * Distinct from `useBrandTheme` in `@altafusion/shell` (Altafusion brand cookie / `[data-brand]`).
 */
export function useTheme() {
  const theme = useState<'light' | 'dark'>('fugue:theme', () => 'dark')

  function toggleTheme() {
    theme.value = theme.value === 'light'
      ? 'dark'
      : 'light'
  }

  const isDark = computed(() => theme.value === 'dark')

  return { theme, isDark, toggleTheme }
}
