import type { NuxtConfig } from 'nuxt/schema'
import type { FugueContentSiteConfig, FugueContentSiteStudioConfig } from '../types/site'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createAppConfig } from '@altafusion/nuxt-base'
import { defu } from 'defu'
import { resolveFugueContentSiteAuth } from './auth-resolve'
import { buildFugueSimpleAuth, fugueContentStudioProtectedRoutes } from './auth-utils'
import { getDefaultI18nOptions } from './i18n-utils'
import { buildFugueContentSiteNetlifySsrConfig } from './netlify-ssr'

/** Install in each Studio-enabled app (devDependencies) — Vite pre-bundles CJS default exports */
export const studioViteOptimizeDeps = ['debug', 'extend', 'slugify'] as const

export { studioPublicPrefixes } from './auth-utils'

/** Resolve fugue-simple-auth from `@altafusion/fugue-content` — apps need not duplicate the dependency. */
export function resolveFugueSimpleAuthLayer(): string {
  const fugueContentRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
  const require = createRequire(join(fugueContentRoot, 'package.json'))
  return dirname(require.resolve('@altafusion/fugue-simple-auth'))
}

function buildStudioConfig(studio: FugueContentSiteStudioConfig) {
  const { repository, route, git } = studio

  return {
    route: route ?? '/_studio',
    repository: {
      provider: repository.provider ?? 'github',
      branch: repository.branch ?? 'main',
      owner: repository.owner,
      repo: repository.repo,
      ...(repository.rootDir
        ? { rootDir: repository.rootDir }
        : {}),
      ...(repository.private !== undefined
        ? { private: repository.private }
        : {})
    },
    ...(git
      ? { git }
      : {})
  }
}

export type CreateAppConfigOptions = NonNullable<Parameters<typeof createAppConfig>[1]>

/**
 * Build a Nuxt config for a Fugue Content site on `@altafusion/fugue-content`.
 *
 * Read access (optional): `@altafusion/fugue-simple-auth` via `auth` block.
 * Edit/publish: Nuxt Studio (Google/GitHub OAuth — env-driven).
 * Public site chrome: `@altafusion/shell` via `createAppConfig` + `@altafusion/fugue-theme`.
 *
 * Apps should keep a **`site.config.ts`** registry (named sections + `siteConfig` /
 * `siteConfigTheme`) and a thin **`nuxt.config.ts`** that calls
 * `defineFugueContentSite(siteConfig, siteConfigTheme)`. See **`@altafusion/fugue-content/site-config-registry`**
 * and **`templates/fugue-content-site/site.config.ts`**.
 *
 * Production deploy with Studio and/or read gate: **`nuxt build` + Netlify SSR** — see
 * developer-docs **[Pilot deploy checklist](/fugue-content/starter-template/pilot-deploy-checklist)**.
 */
export function defineFugueContentSite(
  config: FugueContentSiteConfig,
  createAppOptions: CreateAppConfigOptions = {}
): NuxtConfig {
  const { studio, extraExtends, i18n, ...rest } = config
  const resolvedAuth = resolveFugueContentSiteAuth(config)
  const usePeekGate = resolvedAuth.mode === 'peek' && resolvedAuth.peekConfig

  const defaultLocale = (i18n?.defaultLocale as string | undefined) ?? 'en'
  const mergedI18n = i18n?.locales?.length
    ? defu(i18n, getDefaultI18nOptions(defaultLocale), { langDir: 'locales' })
    : undefined

  const base = createAppConfig({
    extends: [
      '@altafusion/fugue-theme',
      '@altafusion/shell',
      ...(usePeekGate
        ? [
            resolveFugueSimpleAuthLayer()
          ] as const
        : []),
      '@altafusion/fugue-content',
      ...(extraExtends ?? [])
    ],
    ...(mergedI18n
      ? { i18n: mergedI18n }
      : {}),
    ...rest
  }, createAppOptions)

  let result = defu({
    runtimeConfig: {
      public: {
        fugueContent: {
          authMode: resolvedAuth.mode
        }
      }
    }
  }, base) as NuxtConfig

  if (usePeekGate) {
    const peekConfig = resolvedAuth.peekConfig!
    const peekScope = peekConfig.mode ?? 'routes'
    const authConfig = peekScope === 'routes' && studio
      ? {
          ...peekConfig,
          mode: peekScope,
          protectedRoutes: [
            ...fugueContentStudioProtectedRoutes,
            ...(peekConfig.protectedRoutes ?? [])
          ]
        }
      : { ...peekConfig, mode: peekScope }

    result = defu({
      runtimeConfig: {
        public: {
          fugueSimpleAuth: buildFugueSimpleAuth(authConfig, {
            includeStudioBypass: Boolean(studio) && peekScope === 'full'
          })
        }
      }
    }, result) as NuxtConfig
  }

  if (!studio)
    return result

  const studioConfig = defu({
    studio: buildStudioConfig(studio),
    vite: {
      optimizeDeps: {
        include: [...studioViteOptimizeDeps],
        // Scanner treats Nuxt's `#components` import inside `@nuxtjs/i18n` as a
        // missing package export. `include` still pre-bundles the Studio CJS deps.
        noDiscovery: true
      }
    },
    build: {
      transpile: ['nuxt-studio']
    }
  }, result) as NuxtConfig

  if (!usePeekGate) {
    const ssrConfig = buildFugueContentSiteNetlifySsrConfig(resolvedAuth.envPrefix)
    if (ssrConfig)
      return defu(ssrConfig, studioConfig) as NuxtConfig
  }

  return studioConfig
}
