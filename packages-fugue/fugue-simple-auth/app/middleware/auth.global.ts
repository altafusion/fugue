import type { FugueSimpleAuthConfig } from '#simple-auth/types/config'
import { shouldGatePath } from '#simple-auth/lib/path-gate'

export default defineNuxtRouteMiddleware(async (to) => {
  const config = useRuntimeConfig().public.fugueSimpleAuth as FugueSimpleAuthConfig
  const loginPath = config.loginPath

  if (to.path === loginPath)
    return

  // Static export / no access key at build — client gate is inactive (dev still checks live session).
  if (!config.authRequired && !import.meta.dev)
    return

  // Server requests are gated by server/middleware/auth.ts (cookie-aware).
  if (import.meta.server)
    return

  if (!shouldGatePath(to.path, config))
    return

  const { authenticated, required } = await $fetch<{ authenticated: boolean, required: boolean }>(`${config.apiPrefix}/session`)

  if (!required)
    return

  if (!authenticated)
    return navigateTo(`${loginPath}?redirect=${encodeURIComponent(to.fullPath)}`)
})
