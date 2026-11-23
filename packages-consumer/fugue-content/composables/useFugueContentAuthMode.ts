import type { ResolvedFugueContentSiteAuthMode } from '../lib/auth-resolve'
import type { FugueContentPublicAuthConfig } from '../lib/header-actions-registration'
import {
  resolveFugueContentAuthModeFromPublicConfig
} from '../lib/header-actions-registration'

/**
 * Resolved fugue-content-site auth strategy from the site manifest + env (build time).
 * Prefer this over checking `fugueSimpleAuth` directly — peek gate is inactive when mode is `studio`.
 */
export function useFugueContentAuthMode() {
  const runtimeConfig = useRuntimeConfig()
  return resolveFugueContentAuthModeFromPublicConfig(runtimeConfig.public as FugueContentPublicAuthConfig)
}

export type { ResolvedFugueContentSiteAuthMode }
