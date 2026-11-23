/**
 * @altafusion/fugue-devtools — Nuxt layer
 *
 * Generic dev overlay shell (non-modal UDrawer, dock, sections).
 * Product adapters supply domain sections and visibility.
 */

/// <reference path="./types/nuxt-fugue-devtools.d.ts" />

import { fileURLToPath } from 'node:url'

const layerRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineNuxtConfig({
  extends: ['@altafusion/fugue-ui'],

  alias: {
    '#devtools': layerRoot,
  },

  css: [
    fileURLToPath(new URL('./assets/css/devtools-panel.css', import.meta.url)),
  ],

  runtimeConfig: {
    public: {
      fugueDevtools: {
        /** Set `false` when a product adapter registers its own devtools API at the app layer. */
        registerPlugin: true,
        openParams: ['devtools'],
        innerToggleParams: ['devtoolstoggle'],
        persistNamespace: 'app',
        persistKey: 'devtools',
      },
    },
  },
})
