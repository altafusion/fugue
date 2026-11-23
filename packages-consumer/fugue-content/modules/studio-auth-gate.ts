import type { Plugin, UserConfig } from 'vite'
import { createResolver, defineNuxtModule } from '@nuxt/kit'

/**
 * Replace nuxt-studio's dev auto-activation so the editor UI stays closed until
 * **Edit** or **Cmd+.** — optional peek gate only adds a login step before open.
 */
export default defineNuxtModule({
  meta: {
    name: '@altafusion/fugue-content/studio-auth-gate'
  },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const gatedPath = resolver.resolve('../lib/studio-activation-gated.js')

    nuxt.hook('modules:done', () => {
      if (!nuxt.options.studio)
        return

      nuxt.hook('vite:extendConfig', (config, { isClient }) => {
        if (!isClient)
          return

        const gatePlugin: Plugin = {
          name: 'fugue-content:studio-activation-gate',
          enforce: 'pre',
          resolveId(source, importer) {
            if (!importer?.includes('nuxt-studio'))
              return

            const isStudioClientPlugin = importer.includes('plugins/studio.client')
            const isActivationImport = source === '../utils/activation.js'
              || source.endsWith('/utils/activation.js')

            if (isStudioClientPlugin && isActivationImport)
              return gatedPath
          }
        }

        const viteConfig = config as UserConfig
        viteConfig.plugins = [
          ...(viteConfig.plugins ?? []),
          gatePlugin
        ]
      })
    })
  }
})
