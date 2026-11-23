import type { ModuleOptions as NuxtFontsOptions } from '@nuxt/fonts'
import type { ShellAppConfig } from './app-brand'

declare module '@nuxt/schema' {
  interface NuxtConfig {
    fonts?: NuxtFontsOptions | false
  }
  interface NuxtConfigInput {
    fonts?: NuxtFontsOptions | false
  }
}

declare module '#app' {
  interface PageMeta {
    /** Product layout: primary nav highlight and optional aside panels */
    nav?: {
      primary?: string
      /** Aside slot ids enabled for this route (filter panels, etc.) */
      aside?: string[]
    }
    /** Page title for chrome composables and headers */
    title?: string
    /** Single breadcrumb label from route meta (v0 stub) */
    breadcrumb?: string
    /** Shell layout chrome overrides (`default`, `fullscreen`, `minimal`) */
    shell?: {
      header?: boolean
      footer?: boolean
      mainPadding?: boolean
    }
  }

  interface AppConfig extends ShellAppConfig {}

  interface AppConfigInput extends ShellAppConfig {}
}

export {}
