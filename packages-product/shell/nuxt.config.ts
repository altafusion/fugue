/**
 * @altafusion/shell — Nuxt layer
 *
 * Site layouts (default, minimal), product layout (Nuxt UI page chrome),
 * shell composables, Altafusion brand theme CSS (`assets/css/brand-variants.css`),
 * landing/shell section CSS, Noto fonts, and runtime brand switcher.
 * Extends fugue-ui for generic widgets.
 */

/// <reference path="./types/nuxt-shell.d.ts" />

import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { nuxtUiLucideIcons } from './lib/nuxt-ui-icons'

const layerRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineNuxtConfig({
  extends: ['@altafusion/fugue-ui'],

  /** Product sans/serif/mono — declared in themes/tailwind-shell.css @theme; loaded by @nuxt/fonts. */
  fonts: {
    families: [
      {
        name: 'Noto Sans',
        provider: 'google',
        weights: [300, 400, 500, 600, 700],
        global: true
      },
      { name: 'Noto Sans Display', provider: 'google' },
      { name: 'DM Mono', provider: 'google' }
    ]
  },

  css: [
    resolve(layerRoot, './assets/css/brand-variants.css'),
    resolve(layerRoot, './assets/css/shell-sections.css')
  ],

  icon: {
    clientBundle: {
      icons: [...nuxtUiLucideIcons]
    },
    serverBundle: {
      collections: ['lucide']
    }
  },

  imports: {
    dirs: [
      resolve(layerRoot, 'utils')
    ]
  },

  components: [
    {
      path: './components',
      pathPrefix: false
    }
  ]
})
