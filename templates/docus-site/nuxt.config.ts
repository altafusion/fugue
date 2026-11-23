import process from 'node:process'
import { isNuxtDevtoolsEnabled } from '@altafusion/nuxt-base'
import { devServerOptions, templateDevPorts, templateViteServerOptions } from '@altafusion/nuxt-base/dev/ports'
import { reuseDevBrowserOnListen } from '@altafusion/nuxt-base/dev/reuse-dev-browser'
import { omitDocusPackageConfigFromNodeTs } from '@altafusion/nuxt-base/modules/docus-typecheck'

const devPort = Number(process.env.MY_DOCS_DEV_PORT) || Number(process.env.PORT) || templateDevPorts.docusSite

export default defineNuxtConfig({
  extends: ['docus'],

  modules: ['nuxt-studio', omitDocusPackageConfigFromNodeTs, reuseDevBrowserOnListen],

  compatibilityDate: '2026-01-31',

  devtools: {
    enabled: isNuxtDevtoolsEnabled()
  },

  site: {
    name: 'My documentation',
    description: 'Project documentation site.'
  },

  studio: {
    route: '/_studio',
    repository: {
      provider: 'github',
      owner: 'my-org',
      repo: 'my-docs',
      branch: 'main'
    },
    git: {
      commit: {
        messagePrefix: 'content:'
      }
    }
  },

  appConfig: {
    github: {
      url: ''
    }
  },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  },

  build: {
    transpile: ['nuxt-studio']
  },

  devServer: devServerOptions(devPort),

  vite: {
    server: templateViteServerOptions()
  }
})
