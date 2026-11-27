import { devPorts, devServerOptions, devViteServerOptions } from '@altafusion/nuxt-base/dev/ports'

/**
 * Specimen app for the Fugue components. Extends fugue-ui (no theme, no shell) and fugue-devtools, which sits on top of
 * fugue-ui. fugue-ui itself still depends on nothing beyond Nuxt UI and VueUse (see its package.json).
 */
export default defineNuxtConfig({
  extends: ['@altafusion/fugue-ui', '@altafusion/fugue-devtools'],

  devServer: devServerOptions(devPorts.uiPlayground),

  vite: {
    server: devViteServerOptions(),
  },
})
