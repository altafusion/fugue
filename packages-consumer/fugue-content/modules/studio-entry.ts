import { addImportsDir, createResolver, defineNuxtModule } from '@nuxt/kit'

/**
 * Register Studio editor composables for Fugue Content consumer apps.
 * `FugueContentEditContent` lives in `app/components/`; footer/header plugins register editor chrome with the shell.
 */
export default defineNuxtModule({
  meta: {
    name: '@altafusion/fugue-content/studio-entry'
  },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    addImportsDir(resolver.resolve('../composables'))

    nuxt.options.build.transpile = [
      ...new Set([
        ...(nuxt.options.build.transpile ?? []),
        'nuxt-studio'
      ])
    ]
  }
})
