import type { FugueContentSiteAuthConfig, FugueContentSiteAuthMode, FugueContentSiteConfig } from '../types/site'
import process from 'node:process'
import { isAuthEnabledAtBuild } from '@altafusion/fugue-simple-auth/lib/env'

export type ResolvedFugueContentSiteAuthMode = 'peek' | 'studio' | 'off'

export interface ResolvedFugueContentSiteAuth {
  mode: ResolvedFugueContentSiteAuthMode
  envPrefix: string
  peekConfig?: FugueContentSiteAuthConfig
}

/** Build-time signal that Google Studio OAuth is configured on this deploy. */
export function isStudioGoogleConfigured(): boolean {
  return Boolean(
    process.env.STUDIO_GOOGLE_CLIENT_ID
    && process.env.STUDIO_GOOGLE_CLIENT_SECRET
    && process.env.STUDIO_GOOGLE_MODERATORS
  )
}

function resolveEnvPrefix(config: FugueContentSiteConfig): string {
  return config.auth?.envPrefix ?? 'SITE'
}

function resolvePeekConfig(config: FugueContentSiteConfig, envPrefix: string): FugueContentSiteAuthConfig | undefined {
  if (!config.auth)
    return undefined

  return { ...config.auth, envPrefix: config.auth.envPrefix ?? envPrefix }
}

function isPeekEnvConfigured(config: FugueContentSiteConfig, envPrefix: string): boolean {
  return Boolean(config.auth) && isAuthEnabledAtBuild(envPrefix)
}

/**
 * Resolve the effective fugue-content-site auth mode from manifest + env.
 *
 * Hierarchy (`authMode: 'auto'`, default):
 * 1. **`studio`** when Google Studio OAuth env is set — wins over peek even if **`SITE_ACCESS_KEY`** remains.
 * 2. **`peek`** when an auth block exists and peek env is set (no Studio Google env).
 * 3. **`off`** otherwise.
 */
export function resolveFugueContentSiteAuth(config: FugueContentSiteConfig): ResolvedFugueContentSiteAuth {
  const manifestMode: FugueContentSiteAuthMode = config.authMode ?? 'auto'
  const envPrefix = resolveEnvPrefix(config)
  const peekEnv = isPeekEnvConfigured(config, envPrefix)
  const studioEnv = isStudioGoogleConfigured()

  if (manifestMode === 'off')
    return { mode: 'off', envPrefix }

  if (manifestMode === 'studio')
    return { mode: 'studio', envPrefix }

  if (manifestMode === 'peek') {
    const peekConfig = resolvePeekConfig(config, envPrefix)
    if (peekConfig && peekEnv)
      return { mode: 'peek', envPrefix, peekConfig }

    return { mode: 'off', envPrefix }
  }

  // auto — Studio Google wins when both peek and Studio env are present.
  if (studioEnv)
    return { mode: 'studio', envPrefix }

  const peekConfig = resolvePeekConfig(config, envPrefix)
  if (peekConfig && peekEnv)
    return { mode: 'peek', envPrefix, peekConfig }

  return { mode: 'off', envPrefix }
}
