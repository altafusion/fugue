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
    }
  }
}

declare module '#app' {
  interface NuxtApp {
    $fugueDevtools?: import('../composables/devtoolsTypes').DevToolsApi
  }
}

export {}
