import Diagnostics from '#devtools/components/DevTools/Diagnostics.vue'
import { DEVTOOLS_INJECTION_KEY } from '#devtools/composables/devtoolsTypes'
import { createDevToolsApi } from '#devtools/composables/useDevTools'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const devtoolsConfig = config.public.fugueDevtools

  if (devtoolsConfig.registerPlugin === false)
    return

  const router = useRouter()

  const api = createDevToolsApi({
    router,
    initialChrome: devtoolsConfig.defaultPosition
      ? { panelPosition: devtoolsConfig.defaultPosition }
      : undefined,
    isDev: import.meta.dev,
    urlConfig: {
      openParams: devtoolsConfig.openParams ?? ['qetools'],
      innerToggleParams: devtoolsConfig.innerToggleParams ?? ['devtoolstoggle'],
    },
    persist: devtoolsConfig.persistNamespace && devtoolsConfig.persistKey
      ? {
          namespace: devtoolsConfig.persistNamespace,
          key: devtoolsConfig.persistKey,
        }
      : undefined,
  })

  api.registerSection({
    id: 'diagnostics',
    label: 'Diagnostics',
    component: Diagnostics,
    access: 'public',
    order: -1,
  })

  nuxtApp.vueApp.provide(DEVTOOLS_INJECTION_KEY, api)

  // Other layers (fugue-content, a site) register sections through this, without importing this package.
  return {
    provide: { fugueDevtools: api },
  }
})
