/// <reference types="nuxt/schema" />

import type { AppBrandConfig, AppHeaderConfig } from './app-brand'
import type { FugueSimpleAuthConfig } from './config'

declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    fugueSimpleAuth: FugueSimpleAuthConfig
  }
}

declare module '#app' {
  interface AppConfig {
    brand?: AppBrandConfig
    header?: AppHeaderConfig
  }

  interface AppConfigInput {
    brand?: AppBrandConfig
    header?: AppHeaderConfig
  }
}

export {}
