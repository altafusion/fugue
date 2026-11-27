/**
 * @altafusion/fugue-ui — Nuxt layer
 *
 * Generic Vue UI primitives on Nuxt UI. Altafusion FugueAppHeader* variants stay in `./components`.
 */

import { resolve } from 'node:path'

export default defineNuxtConfig({
  extends: ['@altafusion/fugue-nuxt-ui'],

  /**
   * The layer root is type-checked as a whole by every app that extends it. The playground's own `nuxt.config.ts` is a config
   * file (`defineNuxtConfig` is not a global in those apps), so it is left out. List any further playground file that relies
   * on a layer the other apps do not extend.
   */
  typescript: {
    tsConfig: {
      exclude: [
        resolve(__dirname, 'playground/nuxt.config.ts'),
      ],
    },
  },

  components: [
    {
      path: './components',
      pathPrefix: false,
      ignore: ['FugueAppHeaderDefault.vue', 'FugueAppHeaderLanding.vue', 'fugue-app-header-types.ts'],
    },
  ],
})
