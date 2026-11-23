import type { FugueContentStudioSessionPayload, FugueContentStudioUser } from '../lib/studio-session'
import {
  FUGUE_CONTENT_STUDIO_DEV_AUTH_CHECK,
  FUGUE_CONTENT_STUDIO_DEV_USER,
  FUGUE_CONTENT_STUDIO_SESSION_CHECK,
  FUGUE_CONTENT_STUDIO_SESSION_COOKIE_OPTIONS,
  FUGUE_CONTENT_STUDIO_SESSION_ROUTE,
  hasFugueContentStudioSession,
  resolveFugueContentStudioUser
} from '../lib/studio-session'

export function useFugueContentStudioDevAuthCookie() {
  return useCookie(FUGUE_CONTENT_STUDIO_DEV_AUTH_CHECK, FUGUE_CONTENT_STUDIO_SESSION_COOKIE_OPTIONS)
}

export function useFugueContentStudioSessionCheckCookie() {
  return useCookie(FUGUE_CONTENT_STUDIO_SESSION_CHECK, FUGUE_CONTENT_STUDIO_SESSION_COOKIE_OPTIONS)
}

export function useFugueContentStudioSession() {
  const studioConfig = useRuntimeConfig().public.studio
  const sessionCheck = useFugueContentStudioSessionCheckCookie()
  const devAuthCheck = useFugueContentStudioDevAuthCookie()
  const devUser = useState<FugueContentStudioUser | null>('studio-session', () => null)

  // Never call session.get in dev — nuxt-studio deletes `studio-session-check` when no server session exists.
  const { data: sessionData, pending, refresh } = useAsyncData<FugueContentStudioSessionPayload | null>(
    'fugue-content-studio-session',
    () => {
      if (import.meta.dev || !studioConfig?.route)
        return Promise.resolve(null)

      return $fetch<FugueContentStudioSessionPayload>(FUGUE_CONTENT_STUDIO_SESSION_ROUTE)
    }
  )

  const session = computed((): FugueContentStudioSessionPayload | null | undefined => {
    if (import.meta.dev || !studioConfig?.route)
      return null

    return sessionData.value
  })

  if (import.meta.client && import.meta.dev && devAuthCheck.value === 'true' && !devUser.value?.email)
    devUser.value = FUGUE_CONTENT_STUDIO_DEV_USER

  const user = computed(() => resolveFugueContentStudioUser(session.value, devUser.value, {
    devAuthCheck: devAuthCheck.value,
    sessionCheck: sessionCheck.value,
    isDev: import.meta.dev
  }))

  const isAuthenticated = computed(() => hasFugueContentStudioSession(
    sessionCheck.value,
    session.value,
    devUser.value,
    import.meta.dev,
    devAuthCheck.value
  ))

  function activateDevSession() {
    devUser.value = FUGUE_CONTENT_STUDIO_DEV_USER
    devAuthCheck.value = 'true'
  }

  function clearSession() {
    devAuthCheck.value = null
    sessionCheck.value = null
    devUser.value = null
  }

  return {
    session,
    pending,
    user,
    isAuthenticated,
    refresh,
    activateDevSession,
    clearSession
  }
}
