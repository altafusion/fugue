import type { SimpleAuthSession } from '@altafusion/fugue-simple-auth/lib/login'
import type { FugueSimpleAuthConfig } from '@altafusion/fugue-simple-auth/types/config'

/** Peek-gate session fetch — skips the API when peek auth is inactive. */
export function useFugueContentPeekSession() {
  const { hasPeekGate } = useFugueContentAuthMode()
  const config = useRuntimeConfig().public.fugueSimpleAuth as FugueSimpleAuthConfig | undefined

  const { data, pending, refresh } = useAsyncData<SimpleAuthSession | null>(
    'fugue-simple-auth-session',
    () => {
      if (!hasPeekGate || !config?.apiPrefix)
        return Promise.resolve(null)

      return $fetch<SimpleAuthSession>(`${config.apiPrefix}/session`)
    }
  )

  const session = computed((): SimpleAuthSession | null | undefined => {
    if (!hasPeekGate || !config?.apiPrefix)
      return null

    return data.value
  })

  return {
    session,
    pending,
    refresh
  }
}
