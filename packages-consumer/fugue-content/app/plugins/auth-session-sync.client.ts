import type { FugueSimpleAuthConfig } from '@altafusion/fugue-simple-auth/types/config'
import { useSimpleAuthSession } from '@altafusion/fugue-simple-auth/composables/useSimpleAuthSession'
import { shouldClearStaleAuthSession } from '@altafusion/fugue-simple-auth/lib/login'

/**
 * Drop orphan peek-gate cookies when the session API says they are inactive
 * (rotated access key, gate disabled on server, or invalid HMAC).
 */
export default defineNuxtPlugin((nuxtApp) => {
  const { hasPeekGate } = useFugueContentAuthMode()
  if (!hasPeekGate)
    return

  const config = useRuntimeConfig().public.fugueSimpleAuth as FugueSimpleAuthConfig | undefined
  if (!config?.apiPrefix)
    return

  const { data: session, refresh } = useSimpleAuthSession()

  nuxtApp.hook('app:mounted', async () => {
    await refresh()

    if (!shouldClearStaleAuthSession(session.value))
      return

    try {
      await $fetch(`${config.apiPrefix}/logout`, { method: 'POST' })
      await refresh()
    } catch {
      // Non-fatal — UI still gates on session.required / authenticated.
    }
  })
})
