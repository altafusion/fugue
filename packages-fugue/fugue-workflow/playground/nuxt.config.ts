/**
 * Standalone consumer of `@altafusion/fugue-workflow`. If this app needs anything beyond
 * that layer (and its transitive fugue-ui / fugue-nuxt-ui stack) to boot, treat that
 * as a coupling bug in the layer — do not paper over it here.
 */
export default defineNuxtConfig({
  extends: ['@altafusion/fugue-workflow'],
  ssr: false,
})
