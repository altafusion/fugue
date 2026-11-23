/**
 * Shared Nuxt modules configuration
 * Used by the layer and createAppConfig.
 *
 * ESLint stylistic defaults live in `sharedModuleConfig` below (sourced from `@altafusion/eslint-config`).
 * The `@nuxt/eslint` module is registered on `@altafusion/fugue-nuxt-ui` / `@altafusion/fugue-theme`
 * (not here): it only emits `.nuxt/eslint.config.mjs` for a consuming app when registered on a layer the app
 * directly extends — merged modules from `extends: ['@altafusion/nuxt-base']` do not run that hook in the app root.
 */

import process from 'node:process'
import { sharedStylisticDefaults } from '@altafusion/eslint-config/stylistic'

export const sharedModules: string[] = []

/**
 * Nuxt DevTools toggle via env (Nuxt has no built-in flag).
 * - unset / empty → enabled (Nuxt 4 default)
 * - `NUXT_DEVTOOLS=false|0|off|no` → disabled
 * - any other value → enabled
 */
export function isNuxtDevtoolsEnabled(
  raw: string | undefined = process.env.NUXT_DEVTOOLS,
): boolean {
  if (raw === undefined || raw.trim() === '')
    return true
  return !['false', '0', 'off', 'no'].includes(raw.trim().toLowerCase())
}

/** Lazy — read at config merge time so `.env` / dotenv is already applied. */
export const sharedDevtoolsConfig = {
  get enabled() {
    return isNuxtDevtoolsEnabled()
  },
}

export const sharedModuleConfig = {
  eslint: {
    config: {
      stylistic: {
        ...sharedStylisticDefaults,
      },
    },
  },
}

export const sharedRuntimeConfig = {
  public: {},
}
