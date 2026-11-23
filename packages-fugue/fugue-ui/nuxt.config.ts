/**
 * @altafusion/fugue-ui — Nuxt layer
 *
 * Generic Vue UI primitives on Nuxt UI. Altafusion FugueAppHeader* variants stay in `./components`.
 */

export default defineNuxtConfig({
  extends: ['@altafusion/fugue-nuxt-ui'],

  components: [
    {
      path: './components',
      pathPrefix: false,
      ignore: ['FugueAppHeaderDefault.vue', 'FugueAppHeaderLanding.vue', 'fugue-app-header-types.ts'],
    },
  ],
})
