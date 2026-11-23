import type { FugueSimpleAuthMode } from '@altafusion/fugue-simple-auth/types/config'

export type FugueContentStudioEditorProvider = 'google' | 'github' | 'both'

export interface FugueContentSiteStudioRepository {
  provider?: 'github' | 'gitlab'
  owner: string
  repo: string
  branch?: string
  /** Monorepo subdirectory — e.g. `templates/fugue-content-site` or `apps/my-site` */
  rootDir?: string
  private?: boolean
}

export interface FugueContentSiteStudioEditors {
  /**
   * Preferred Studio login for content editors.
   * Wired via Nuxt Studio env vars — not a runtime module option.
   */
  provider?: FugueContentStudioEditorProvider
}

export interface FugueContentSiteStudioConfig {
  route?: string
  repository: FugueContentSiteStudioRepository
  editors?: FugueContentSiteStudioEditors
  git?: {
    commit?: {
      messagePrefix?: string
    }
  }
}

/**
 * Site auth strategy — resolved at build into `runtimeConfig.public.fugueContent.authMode`.
 *
 * - **`studio`** — Google OAuth via `STUDIO_GOOGLE_*` only; ignores peek env.
 * - **`peek`** — `SITE_ACCESS_KEY` gate via fugue-simple-auth.
 * - **`auto`** (default) — Studio Google env wins over peek when both are set.
 * - **`off`** — no read gate; Studio OAuth only when env is configured.
 */
export type FugueContentSiteAuthMode = 'studio' | 'peek' | 'auto' | 'off'

export interface FugueContentSiteAuthConfig {
  /** Env prefix — defaults to `SITE` → `SITE_ACCESS_KEY`, `SITE_AUTH_ENABLED` */
  envPrefix: string
  /** Peek gate scope — `routes` (Studio only) or `full` (whole site). Not the cms auth strategy. */
  mode?: FugueSimpleAuthMode
  cookieName?: string
  sessionLabel?: string
  loginDescription?: string
  protectedRoutes?: string[]
  /** Extra paths that bypass the read gate (Studio paths are added when `studio` is set) */
  publicPrefixes?: string[]
}

export interface FugueContentSiteConfig extends Record<string, unknown> {
  /**
   * Auth strategy for this site — see **`FugueContentSiteAuthMode`**.
   * Set in **`site.config.ts`** (manifest); exposed at runtime as **`fugueContent.authMode`**.
   */
  authMode?: FugueContentSiteAuthMode
  auth?: FugueContentSiteAuthConfig
  studio?: FugueContentSiteStudioConfig
  /**
   * `@nuxtjs/i18n` options — when `locales` is set, fugue-content-site registers the module
   * and builds per-locale Content collections (`pages_en`, `pages_es`, …).
   */
  i18n?: Record<string, unknown> & {
    locales?: Array<string | { code: string, name?: string, file?: string, isCatchallLocale?: boolean }>
    defaultLocale?: string
    langDir?: string
  }
  /**
   * Additional Nuxt layers after the default cms stack.
   * Prefer this over `extends` in the spread rest — `defu` replaces `extends` arrays.
   */
  extraExtends?: string[]
}
