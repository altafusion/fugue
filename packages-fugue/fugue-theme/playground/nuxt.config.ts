import { devPorts, devServerOptions, devViteServerOptions } from '@altafusion/nuxt-base/dev/ports'

/**
 * Specimen app for fugue-theme tokens plus shell chrome.
 * No palette override — product brands stay in their own apps.
 */
export default defineNuxtConfig({
  extends: ['@altafusion/fugue-theme', '@altafusion/shell'],

  devServer: devServerOptions(devPorts.themePlayground),

  vite: {
    server: devViteServerOptions(),
  },
})
