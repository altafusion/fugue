/// <reference types="nuxt/schema" />

declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    fugueDevtools: {
      registerPlugin?: boolean
      openParams: string[]
      innerToggleParams: string[]
      persistNamespace?: string
      persistKey?: string
    }
  }
}

export {}
