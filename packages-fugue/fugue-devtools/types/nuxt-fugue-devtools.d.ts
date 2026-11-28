/// <reference types="nuxt/schema" />

declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    fugueDevtools: {
      registerPlugin?: boolean
      openParams: string[]
      innerToggleParams: string[]
      persistNamespace?: string
      persistKey?: string
      defaultPosition?: 'top' | 'right' | 'bottom' | 'left'
      /** The site's installed `@altafusion/*` packages and versions, filled in at build time. */
      packages?: Record<string, string>
      /** The site's own name, version and build commit, filled in at build time; set a field in `nuxt.config` to override it. */
      app?: import('../utils/appInfo').AppInfo
    }
  }
}

declare module '#app' {
  interface NuxtApp {
    $fugueDevtools?: import('../composables/devtoolsTypes').DevToolsApi
  }
}

export {}
