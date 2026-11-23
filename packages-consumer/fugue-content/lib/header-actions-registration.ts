import type { ResolvedFugueContentSiteAuthMode } from './auth-resolve'

/** Hook used to register shell header actions — must run after SSR hydration. */
export const FUGUE_CONTENT_HEADER_ACTIONS_REGISTER_AFTER = 'onNuxtReady' as const

export interface FugueContentPublicAuthConfig {
  fugueContent?: { authMode?: ResolvedFugueContentSiteAuthMode }
  fugueSimpleAuth?: unknown
  studio?: { route?: string }
}

export function resolveFugueContentAuthModeFromPublicConfig(publicConfig: FugueContentPublicAuthConfig) {
  const authMode = (publicConfig.fugueContent?.authMode ?? 'off') as ResolvedFugueContentSiteAuthMode
  const hasPeekGate = authMode === 'peek' && Boolean(publicConfig.fugueSimpleAuth)
  const hasStudioAuth = authMode === 'studio' && Boolean(publicConfig.studio?.route)

  return {
    authMode,
    hasPeekGate,
    hasStudioAuth
  }
}

export function shouldRegisterFugueContentHeaderActions(publicConfig: FugueContentPublicAuthConfig): boolean {
  const { hasPeekGate, hasStudioAuth } = resolveFugueContentAuthModeFromPublicConfig(publicConfig)
  return Boolean(publicConfig.studio?.route || hasPeekGate || hasStudioAuth)
}

/**
 * Clear header actions before hydrate, register only after hydration completes.
 * Extracted for unit tests — client plugin passes `onNuxtReady` as `scheduleAfterHydration`.
 */
export function scheduleFugueContentHeaderActionsRegistration(options: {
  clear: () => void
  register: () => void
  scheduleAfterHydration: (registerFn: () => void) => void
}) {
  options.clear()
  options.scheduleAfterHydration(() => {
    options.register()
  })
}
