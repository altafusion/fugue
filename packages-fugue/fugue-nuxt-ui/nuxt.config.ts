/**
 * @altafusion/fugue-nuxt-ui — unbranded Nuxt UI base for the Fugue family.
 *
 * Registers @nuxt/ui + @nuxt/eslint (apps must directly extend a layer that registers
 * @nuxt/eslint for the app-root eslint hook — this layer or e.g. @altafusion/fugue-theme;
 * see packages-platform/nuxt-base/modules.ts).
 * NO fonts, NO brand tokens, NO color mapping — optional @altafusion/fugue-theme adds theme/tokens.
 */

import { resolve } from 'node:path'

export default defineNuxtConfig({
  extends: ['@altafusion/nuxt-base'],

  modules: ['@nuxt/eslint', '@nuxt/ui'],

  /** Products load typography (e.g. @altafusion/shell). Avoid @nuxt/fonts Google fetch at build. */
  ui: {
    fonts: false,
  },

  css: [
    resolve(__dirname, './assets/css/nuxt-ui.css'),
  ],
})
