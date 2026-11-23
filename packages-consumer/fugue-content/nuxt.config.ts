/**
 * @altafusion/fugue-content — Nuxt layer
 *
 * Nuxt Content, MDC blocks, and content page routing for consumer marketing sites.
 * Composes with @altafusion/shell (site chrome stays in shell).
 *
 * Styling: MDC blocks and layouts use Nuxt UI + Tailwind semantic tokens
 * (`text-highlighted`, `UButton`, …). Apps must directly extend
 * `@altafusion/fugue-theme` and pass `enableNuxtUI: true` in `createAppConfig`.
 */

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { useNuxt } from '@nuxt/kit'

const layerDir = dirname(fileURLToPath(import.meta.url))

async function patchContentComponentsTs(buildDir: string) {
  const { readFile, writeFile } = await import('node:fs/promises')
  const componentsPath = join(buildDir, 'content/components.ts')
  try {
    let src = await readFile(componentsPath, 'utf8')
    if (!src.includes('@ts-nocheck')) {
      src = `// @ts-nocheck\n${src}`
      await writeFile(componentsPath, src)
    }
  } catch {
    // Content may not have generated component loaders yet.
  }
}

export default defineNuxtConfig({
  extends: ['@altafusion/shell'],

  typescript: {
    nodeTsConfig: {
      include: [
        '../content.config.ts',
        '../lib/**/*.ts',
        '../types/**/*.ts',
        '../types/**/*.d.ts'
      ]
    }
  },

  modules: [
    join(layerDir, 'modules/i18n'),
    join(layerDir, 'modules/landing-components'),
    join(layerDir, 'modules/studio-entry'),
    join(layerDir, 'modules/studio-auth-gate'),
    '@nuxt/content',
    'nuxt-studio'
  ],

  build: {
    transpile: ['nuxt-studio']
  },

  content: {
    experimental: { sqliteConnector: 'native' }
  },

  mdc: {
    components: {
      map: {
        cta: 'CallToAction'
      }
    }
  },

  components: [
    {
      path: './components',
      pathPrefix: false
    }
  ],

  hooks: {
    'app:templatesGenerated': async () => {
      await patchContentComponentsTs(useNuxt().options.buildDir)
    },
    'ready': async (nuxt) => {
      await patchContentComponentsTs(nuxt.options.buildDir)
    },
    'nitro:config': (nitroConfig) => {
      nitroConfig.plugins = nitroConfig.plugins ?? []
      nitroConfig.plugins.push(join(layerDir, 'server/plugins/studio-hash-cleanup.ts'))
    }
  }
})
