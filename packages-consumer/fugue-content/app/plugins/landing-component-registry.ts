import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'
import { localComponentLoaders } from '#content/components'

/**
 * Register app Vue components globally so `FugueContentLandingPage` can resolve manifest
 * `component` names in dynamic `:is` (auto-imports are compile-time only).
 */
export default defineNuxtPlugin((nuxtApp) => {
  for (const [name, loader] of Object.entries(localComponentLoaders)) {
    if (nuxtApp.vueApp.component(name))
      continue
    nuxtApp.vueApp.component(name, defineAsyncComponent(loader as () => Promise<Component>))
  }
})
