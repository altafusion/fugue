import { devPorts, devServerOptions, devViteServerOptions } from '@altafusion/nuxt-base/dev/ports'

/**
 * Specimen app for fugue-ui components. Extends only fugue-ui (no theme, no shell), so a component here proves it needs
 * nothing beyond Nuxt UI and VueUse.
 */
export default defineNuxtConfig({
  extends: ['@altafusion/fugue-ui'],

  devServer: devServerOptions(devPorts.uiPlayground),

  vite: {
    server: devViteServerOptions(),
  },
})
