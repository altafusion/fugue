import type { FugueSimpleAuthConfig } from '@altafusion/fugue-simple-auth/types/config'
import { shouldShowSimpleAuthSignOut } from '@altafusion/fugue-simple-auth/lib/login'
import {
  FUGUE_CONTENT_STUDIO_DEV_AUTH_CHECK,
  FUGUE_CONTENT_STUDIO_SESSION_CHECK,
  FUGUE_CONTENT_STUDIO_SESSION_COOKIE_OPTIONS,
  FUGUE_CONTENT_STUDIO_SESSION_ROUTE,
  isFugueContentStudioSessionCheck
} from '../lib/studio-session'

async function signOutStudioIfActive(clearSession: () => void) {
  if (!import.meta.client)
    return

  const studioRoute = useRuntimeConfig().public.studio?.route
  if (!studioRoute)
    return

  const devAuthCheck = useCookie(FUGUE_CONTENT_STUDIO_DEV_AUTH_CHECK, FUGUE_CONTENT_STUDIO_SESSION_COOKIE_OPTIONS)
  const sessionCheck = useCookie(FUGUE_CONTENT_STUDIO_SESSION_CHECK, FUGUE_CONTENT_STUDIO_SESSION_COOKIE_OPTIONS)

  const hasDevSession = import.meta.dev && isFugueContentStudioSessionCheck(devAuthCheck.value)
  const hasProdSession = isFugueContentStudioSessionCheck(sessionCheck.value)

  if (!hasDevSession && !hasProdSession)
    return

  if (hasProdSession) {
    try {
      await $fetch(FUGUE_CONTENT_STUDIO_SESSION_ROUTE, { method: 'DELETE' })
    } catch {
      // Best effort — still tear down client state below.
    }
  }

  clearSession()
  document.querySelector('nuxt-studio')?.remove()
  document.body.removeAttribute('data-studio-active')

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map(registration => registration.unregister()))
  }
}

/**
 * End peek and/or Studio sessions. Does not navigate — caller stays on the current page.
 */
export function useFugueContentAuthSignOut() {
  const { hasPeekGate } = useFugueContentAuthMode()
  const { isAuthenticated, refresh: refreshStudioSession, clearSession } = useFugueContentStudioSession()
  const config = useRuntimeConfig().public.fugueSimpleAuth as FugueSimpleAuthConfig | undefined
  const { session: peekSession, refresh: refreshPeekSession } = useFugueContentPeekSession()

  const showPeekSignOut = computed(() => {
    if (!hasPeekGate)
      return false

    return shouldShowSimpleAuthSignOut(peekSession.value)
  })

  async function signOut() {
    await signOutStudioIfActive(clearSession)

    if (hasPeekGate && config?.apiPrefix) {
      try {
        await $fetch(`${config.apiPrefix}/logout`, { method: 'POST' })
      } catch {
        // Ignore — studio session already cleared above.
      }
      await refreshPeekSession()
    }

    await refreshStudioSession()
  }

  return {
    isAuthenticated,
    showPeekSignOut,
    signOut
  }
}
