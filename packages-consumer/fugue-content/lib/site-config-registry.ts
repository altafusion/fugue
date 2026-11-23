import type { FugueContentSiteAuthConfig, FugueContentSiteAuthMode, FugueContentSiteStudioConfig } from '../types/site'

/**
 * Shared builders for Fugue Content consumer `site.config.ts` registries.
 *
 * Each app keeps its own registry file (section exports + combined `siteConfig`).
 * `nuxt.config.ts` stays a thin entry that calls `defineFugueContentSite(siteConfig, siteConfigTheme)`.
 */

function envPrefixSlug(envPrefix: string): string {
  return envPrefix.toLowerCase().replace(/_/g, '-')
}

/** Manifest auth strategy — see **`FugueContentSiteAuthMode`** in `@altafusion/fugue-content/types`. */
export function fugueContentAuthModeSection(authMode: FugueContentSiteAuthMode): { authMode: FugueContentSiteAuthMode } {
  return { authMode }
}

/**
 * Optional fugue-simple-auth peek gate for Fugue Content (Netlify SSR + Studio).
 * Default peek scope **`routes`** — public site is open; **`SITE_ACCESS_KEY`** gates Studio only.
 * Use peek scope **`mode: 'full'`** for a pre-launch lock on the whole site.
 *
 * Pair with **`authMode: 'peek'`** (or **`auto`** when only peek env is set). For Google-only
 * pilots, use **`fugueContentAuthModeSection('studio')`** instead and omit this section.
 */
export function fugueContentAuthSection(options: {
  /** Defaults to `SITE` → `SITE_ACCESS_KEY`, `SITE_AUTH_ENABLED` (one Netlify site per app). */
  envPrefix?: string
  /**
   * Cookie/session identity slug — defaults to env prefix slug.
   * Set per app (e.g. `my-site`) when multiple Fugue Content apps share `SITE_*` env on localhost.
   */
  cookieSlug?: string
  mode?: FugueContentSiteAuthConfig['mode']
  loginDescription?: string
  cookieName?: string
  sessionLabel?: string
  protectedRoutes?: string[]
} = {}): { auth: FugueContentSiteAuthConfig } {
  const envPrefix = options.envPrefix ?? 'SITE'
  const cookieSlug = options.cookieSlug ?? envPrefixSlug(envPrefix)

  return {
    auth: {
      envPrefix,
      mode: options.mode ?? 'routes',
      cookieName: options.cookieName ?? `${cookieSlug}-auth`,
      sessionLabel: options.sessionLabel ?? `${cookieSlug}-authenticated`,
      loginDescription:
        options.loginDescription ?? 'Enter the access key to open the content editor.',
      ...(options.protectedRoutes?.length
        ? { protectedRoutes: options.protectedRoutes }
        : {})
    }
  }
}

/** Standard Nuxt Studio block for monorepo Fugue Content apps. */
export function fugueContentStudioSection(options: {
  rootDir: string
  messagePrefix: string
}): { studio: FugueContentSiteStudioConfig } {
  return {
    studio: {
      repository: {
        owner: 'altafusion',
        repo: 'altafusion-monorepo',
        branch: 'main',
        rootDir: options.rootDir
      },
      editors: { provider: 'google' },
      git: {
        commit: {
          messagePrefix: options.messagePrefix
        }
      }
    }
  }
}
