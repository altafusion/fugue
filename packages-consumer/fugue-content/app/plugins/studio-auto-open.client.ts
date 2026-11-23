import { onNuxtReady } from '#app'
import { openFugueContentStudioEditorPanel } from '../../lib/studio-auto-open'

/**
 * Mount Studio whenever an editor session exists — initial load, refresh, and SPA navigations.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const studioRoute = useRuntimeConfig().public.studio?.route
  if (!studioRoute)
    return

  const { isAuthenticated } = useFugueContentStudioSession()

  async function restoreStudioEditor() {
    await nextTick()

    if (!isAuthenticated.value)
      return

    await openFugueContentStudioEditorPanel()
  }

  onNuxtReady(() => {
    void restoreStudioEditor()
  })

  nuxtApp.hook('page:finish', () => {
    void restoreStudioEditor()
  })
})
