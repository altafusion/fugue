import type { FugueSimpleAuthConfig } from '../types/config'
import { shouldShowSimpleAuthSignOut } from '../lib/login'

export function useSimpleAuthSignOut(options?: { redirectTo?: string }) {
  const { data: session, refresh } = useSimpleAuthSession()
  const redirectTo = options?.redirectTo ?? '/'

  const showSignOut = computed(() => shouldShowSimpleAuthSignOut(session.value))

  async function signOut() {
    const config = useRuntimeConfig().public.fugueSimpleAuth as FugueSimpleAuthConfig
    await $fetch(`${config.apiPrefix}/logout`, { method: 'POST' })
    await refresh()
    await navigateTo(redirectTo)
  }

  return {
    showSignOut,
    signOut
  }
}
