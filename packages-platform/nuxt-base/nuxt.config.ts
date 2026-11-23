/**
 * @altafusion/nuxt-base — Nuxt layer
 *
 * Base layer providing shared modules and config.
 * fugue-theme extends this; product apps extend fugue-theme and shell.
 */

import { reuseDevBrowserOnListen } from './dev/reuse-dev-browser'
import { sharedDevtoolsConfig, sharedModuleConfig, sharedModules, sharedRuntimeConfig } from './modules'
import { sharedTypeScriptConfig } from './typescript'

export default defineNuxtConfig({
  modules: [
    ...sharedModules,
    reuseDevBrowserOnListen,
  ],

  ...sharedModuleConfig,

  typescript: sharedTypeScriptConfig,

  runtimeConfig: sharedRuntimeConfig,

  // Env: `NUXT_DEVTOOLS=false` to disable (see `isNuxtDevtoolsEnabled` in modules.ts).
  devtools: sharedDevtoolsConfig,

  compatibilityDate: '2026-05-22',

  css: [],

  vite: {
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
    },
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
})
