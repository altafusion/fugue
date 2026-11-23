import type { SimpleAuthSession } from '../lib/login'
import type { FugueSimpleAuthConfig } from '../types/config'

export function useSimpleAuthSession() {
  const config = useRuntimeConfig().public.fugueSimpleAuth as FugueSimpleAuthConfig

  // Static export without auth at build time — no /api/auth/* handlers exist.
  // Dev always hits the session API so runtime access-key detection matches the server.
  if (!config.authRequired && !import.meta.dev) {
    return useAsyncData<SimpleAuthSession>(
      'fugue-simple-auth-session',
      () => Promise.resolve({ authenticated: true, required: false })
    )
  }

  return useFetch<SimpleAuthSession>(() => `${config.apiPrefix}/session`, {
    key: 'fugue-simple-auth-session'
  })
}
