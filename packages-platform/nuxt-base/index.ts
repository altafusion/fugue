/**
 * Shared Nuxt configuration for Altafusion packages
 * Layer provides modules; this exports createAppConfig for app-specific overrides
 */

import type { NuxtConfig } from 'nuxt/schema'
import { defu } from 'defu'
import { mergeConfig } from 'vite'
import { pinDevServerHmr } from './dev/ports'
import { reuseDevBrowserOnListen } from './dev/reuse-dev-browser'
import { buildNuxtUIConfig } from './lib/nuxt-ui-theme'
import {
  isNuxtDevtoolsEnabled,
  sharedDevtoolsConfig,
  sharedModuleConfig,
  sharedRuntimeConfig,
} from './modules'
import { sharedTypeScriptConfig } from './typescript'

export { buildNuxtUIConfig, mirrorAppUiTheme, mirrorAppUiThemeFromPalette, nuxtUIOptionsFromPalette, siteConfigThemeFromPalette } from './lib/nuxt-ui-theme'
export type { NuxtUiSemanticColors, NuxtUiThemeInput, SitePalette } from './lib/nuxt-ui-theme'
export {
  isNuxtDevtoolsEnabled,
  sharedDevtoolsConfig,
  sharedModuleConfig,
  sharedModules,
  sharedRuntimeConfig,
} from './modules'
export { sharedTSConfig, sharedTypeScriptConfig } from './typescript'

const STYLESHEET_EXT = /\.(?:css|scss|sass|less|styl(?:us)?)(?:[?#].*)?$/i

/** Resolve app-local or explicit theme CSS path for `createAppConfig({ theme })`. */
export function resolveThemeCss(theme: string): string {
  if (theme.startsWith('~') || theme.startsWith('@') || theme.startsWith('.') || theme.includes('/')) {
    return STYLESHEET_EXT.test(theme)
      ? theme
      : `${theme}.css`
  }
  return `~/assets/css/themes/${theme}-theme.css`
}

/**
 * Base Nuxt configuration (for createAppConfig merge)
 * Modules come from the layer — do not duplicate here
 */
export const baseNuxtConfig = {
  modules: [] as string[],
  ...sharedModuleConfig,
  typescript: sharedTypeScriptConfig,
  runtimeConfig: sharedRuntimeConfig,
  devtools: sharedDevtoolsConfig,
  compatibilityDate: '2026-05-22' as const,
  css: [] as string[],
  vite: {
    define: { __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false' },
  },
  nitro: {
    routeRules: {
      '/sw.js': {
        headers: { 'Cache-Control': 'no-cache' },
      },
      '/workbox-*.js': {
        headers: { 'Cache-Control': 'no-cache' },
      },
    },
  },
}

/**
 * Create app-specific configuration by merging base with overrides
 */
export function createAppConfig(
  overrides: Record<string, unknown> = {},
  options: {
    theme?: string
    enableNuxtUI?: boolean
    nuxtUIOptions?: Record<string, unknown>
    additionalCSS?: string[]
    /** Dark canvas when `data-theme="dark"` — `gray` (default) or `black`. */
    darkCanvas?: 'gray' | 'black'
  } = {},
): NuxtConfig {
  const {
    theme,
    enableNuxtUI = false,
    nuxtUIOptions = {},
    additionalCSS = [],
    darkCanvas = 'gray',
  } = options

  const {
    vite: viteOverride,
    hooks: userHooksRaw,
    nitro: nitroOverride,
    devtools: devtoolsOverride,
    ui: uiOverride,
    ...restOverrides
  } = overrides
  const userHooks = (userHooksRaw as Record<string, unknown> | undefined) ?? {}
  const userViteExtendRaw = userHooks['vite:extendConfig']
  // eslint-disable-next-line no-unused-vars -- `this` types the hook call context
  type ViteExtendConfigHook = (this: unknown, _config: Record<string, unknown>, _context: unknown) => unknown
  const userViteExtendHooks: ViteExtendConfigHook[] = []
  if (typeof userViteExtendRaw === 'function') {
    userViteExtendHooks.push(userViteExtendRaw as ViteExtendConfigHook)
  } else if (Array.isArray(userViteExtendRaw)) {
    for (const hook of userViteExtendRaw) {
      if (typeof hook === 'function')
        userViteExtendHooks.push(hook as ViteExtendConfigHook)
    }
  }
  const { 'vite:extendConfig': _userViteExtendIgnored, ...restUserHooks } = userHooks

  const mergedHooks: Record<string, unknown> = { ...restUserHooks }
  mergedHooks['vite:extendConfig'] = async function (this: unknown, viteInlineConfig: Record<string, unknown>, context: unknown) {
    for (const hook of userViteExtendHooks)
      await hook.call(this, viteInlineConfig, context)
    const server = (viteInlineConfig.server ??= {}) as {
      hmr?: Record<string, unknown> | boolean
    }
    pinDevServerHmr(server)
  }

  const cssFiles = [
    ...(theme
      ? [
          resolveThemeCss(theme),
        ]
      : []),
    ...additionalCSS,
    ...((overrides.css as string[]) || []),
  ]

  const overrideModules = (overrides.modules ?? []) as NonNullable<NuxtConfig['modules']>
  const modules: NuxtConfig['modules'] = [
    reuseDevBrowserOnListen,
    ...overrideModules,
  ]

  const baseNitro = baseNuxtConfig.nitro ?? {}
  const overrideNitro
    = typeof nitroOverride === 'object' && nitroOverride !== null
      ? nitroOverride
      : {}
  const mergedNitro = {
    ...baseNitro,
    ...overrideNitro,
    routeRules: {
      ...(baseNitro.routeRules ?? {}),
      ...((overrideNitro as { routeRules?: Record<string, unknown> }).routeRules ?? {}),
    },
  }

  const mergedUi = enableNuxtUI
    ? buildNuxtUIConfig({
        primary: 'blue',
        gray: 'slate',
        ...nuxtUIOptions,
        ...(typeof uiOverride === 'object' && uiOverride
          ? uiOverride
          : {}),
      })
    : typeof uiOverride === 'object' && uiOverride
      ? uiOverride
      : undefined

  const hasExplicitDevtoolsEnabled = typeof devtoolsOverride === 'object'
    && devtoolsOverride !== null
    && 'enabled' in devtoolsOverride

  return {
    // Nested defaults (e.g. eslint.config.stylistic) must survive app overrides.
    ...defu(restOverrides as Record<string, unknown>, baseNuxtConfig as Record<string, unknown>),
    vite: mergeConfig(
      baseNuxtConfig.vite,
      (viteOverride ?? {}) as Record<string, unknown>,
    ),
    nitro: mergedNitro,
    css: cssFiles,
    modules,
    // Per-app Nuxt UI token overrides (@nuxt/ui module lives on @altafusion/fugue-nuxt-ui).
    ...(mergedUi !== undefined
      ? { ui: mergedUi }
      : {}),
    runtimeConfig: {
      ...baseNuxtConfig.runtimeConfig,
      ...(overrides.runtimeConfig as object),
      public: {
        ...baseNuxtConfig.runtimeConfig.public,
        theme: theme || 'default',
        hasNuxtUI: enableNuxtUI,
        darkCanvas,
        ...((overrides.runtimeConfig as { public?: object })?.public || {}),
      },
    },
    hooks: mergedHooks,
    // App-level — wins over layers that hardcode DevTools on (e.g. Docus).
    // Explicit devtools boolean or enabled wins; otherwise NUXT_DEVTOOLS.
    devtools: {
      ...(typeof devtoolsOverride === 'object' && devtoolsOverride
        ? devtoolsOverride
        : {}),
      enabled: typeof devtoolsOverride === 'boolean'
        ? devtoolsOverride
        : hasExplicitDevtoolsEnabled
          ? Boolean((devtoolsOverride as { enabled: unknown }).enabled)
          : isNuxtDevtoolsEnabled(),
    },
  } as NuxtConfig
}
