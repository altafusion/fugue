import type { FugueContentLandingSection } from '../../lib/landing'

/**
 * One-page landing sections from `content/{locale}/settings/site.yml` → `landing.sections`.
 */
export function useFugueContentLanding() {
  const { settings, pending, error } = useFugueContentSettings()

  const sections = computed((): FugueContentLandingSection[] => {
    const landing = settings.value?.landing
    if (!landing?.sections?.length)
      return []
    return landing.sections
  })

  const hasLanding = computed(() => sections.value.length > 0)

  return {
    sections,
    hasLanding,
    pending,
    error
  }
}
