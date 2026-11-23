import { getCurrentInstance, onMounted, onUnmounted } from 'vue'
import { isNuxtStudioMounted } from '../app/utils/studio-mount'
import { openFugueContentStudioEditorPanel } from '../lib/studio-auto-open'

/**
 * Open Nuxt Studio from editor chrome (**Edit content** menu or ⌘. in dev).
 * Local dev: mount in-page after `/login` or ⌘.
 * Production: Google OAuth via `/_studio`.
 */
export function useFugueContentStudioEditorEntry() {
  const runtimeConfig = useRuntimeConfig()
  const studioConfig = runtimeConfig.public.studio
  const route = useRoute()
  const isActive = ref(false)
  const isClientReady = ref(false)

  const { hasPeekGate } = useFugueContentAuthMode()
  const { session: peekSession, pending: peekPending } = useFugueContentPeekSession()
  const { isAuthenticated } = useFugueContentStudioSession()

  function refreshActive() {
    isActive.value = isNuxtStudioMounted()
  }

  const instance = getCurrentInstance()
  const inSetup = Boolean(instance && !instance.isMounted)

  function bindStudioActiveWatcher() {
    if (!import.meta.client)
      return

    isClientReady.value = true
    refreshActive()

    const observer = new MutationObserver(() => refreshActive())
    observer.observe(document.body, { childList: true, subtree: true })

    if (inSetup)
      onUnmounted(() => observer.disconnect())
  }

  if (import.meta.client) {
    if (inSetup)
      onMounted(bindStudioActiveWatcher)
    else
      onNuxtReady(bindStudioActiveWatcher)
  }

  function studioOAuthUrl(redirectPath = route.fullPath) {
    const redirect = encodeURIComponent(redirectPath)
    return `${studioConfig!.route}?redirect=${redirect}`
  }

  function goToStudioOAuth(redirectPath = route.fullPath) {
    window.location.assign(studioOAuthUrl(redirectPath))
  }

  async function openEditor() {
    if (!studioConfig?.route || isActive.value)
      return

    const mounted = await openFugueContentStudioEditorPanel()
    refreshActive()
    if (mounted)
      return

    if (!import.meta.dev) {
      if (isAuthenticated.value) {
        console.warn('[fugue-content-site] Nuxt Studio did not open after sign-in. Reload the page and try again.')
        return
      }
      goToStudioOAuth()
      return
    }

    console.warn(
      `[fugue-content-site] Nuxt Studio did not open.${
        hasPeekGate ? ' Log in at /login if prompted, then try again (or ⌘. in dev).' : ' Check the console for nuxt-studio errors, reload, or press ⌘. / Ctrl+.'}`
    )
  }

  function goToLogin(redirectPath = route.fullPath) {
    void navigateTo({
      path: '/login',
      query: { redirect: redirectPath }
    })
  }

  async function handleEditEntry() {
    if (!studioConfig?.route || isActive.value)
      return

    if (!isAuthenticated.value) {
      goToLogin()
      return
    }

    await openEditor()
  }

  return {
    isActive: readonly(isActive),
    isClientReady: readonly(isClientReady),
    peekSession,
    peekPending,
    openEditor,
    handleEditEntry,
    goToLogin,
    goToStudioOAuth,
    refreshActive
  }
}
