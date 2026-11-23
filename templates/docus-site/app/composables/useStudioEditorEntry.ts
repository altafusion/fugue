import { isNuxtStudioMounted, mountNuxtStudioClient } from '~/utils/studio-mount'

/**
 * Open Nuxt Studio from the docs chrome (header "Edit Content").
 * Dev: nuxt-studio auto-activates the host; this attaches the editor UI when needed.
 * Production: OAuth via /_studio.
 */
export function useStudioEditorEntry() {
  const config = useRuntimeConfig().public.studio
  const route = useRoute()
  const isActive = ref(false)

  function refreshActive() {
    isActive.value = isNuxtStudioMounted()
  }

  onMounted(() => {
    refreshActive()
    const observer = new MutationObserver(() => refreshActive())
    observer.observe(document.body, { childList: true, subtree: true })
    onUnmounted(() => observer.disconnect())
  })

  const canOpenEditor = computed(() => Boolean(config?.route))

  const showEditContent = computed(() => {
    if (!canOpenEditor.value || isActive.value)
      return false
    return true
  })

  async function openEditor() {
    if (!config?.route || isActive.value)
      return

    if (!import.meta.dev) {
      const redirect = encodeURIComponent(route.fullPath)
      window.location.assign(`${config.route}?redirect=${redirect}`)
      return
    }

    const mounted = await mountNuxtStudioClient()
    refreshActive()
    if (mounted)
      return

    console.warn(
      '[docus-site] Nuxt Studio did not open. Check console for nuxt-studio errors, reload, or press Cmd+.'
    )
  }

  return {
    isActive: readonly(isActive),
    showEditContent,
    openEditor,
    refreshActive
  }
}
