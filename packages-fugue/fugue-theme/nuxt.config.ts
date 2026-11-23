// Extends @altafusion/fugue-nuxt-ui (unbranded Tailwind + @nuxt/ui + @nuxt/eslint).
// Product-agnostic theme CSS, color-mode hook, dark-canvas, composables.

import { resolve } from 'node:path'

export default defineNuxtConfig({
  extends: ['@altafusion/fugue-nuxt-ui'],

  imports: {
    dirs: [
      resolve(__dirname, 'composables'),
    ],
  },

  /** Align Nuxt UI color-mode with fugue-theme `[data-theme="dark"]` tokens (see `app/plugins/theme.client.ts`). */
  colorMode: {
    dataValue: 'theme',
  },

  css: [
    resolve(__dirname, './themes/theme.css'),
  ],
})
