import { devPorts, devServerOptions, devViteServerOptions } from '@altafusion/nuxt-base/dev/ports'

/**
 * Specimen app for fugue-devtools. It extends only the devtools layer and mounts `<DevToolsPanel />` once in app.vue,
 * so it proves the panel works with no further wiring. Open it with `?qetools`.
 */
export default defineNuxtConfig({
  extends: ['@altafusion/fugue-devtools'],

  devServer: devServerOptions(devPorts.devtoolsPlayground),

  vite: {
    server: devViteServerOptions(),
  },
})
