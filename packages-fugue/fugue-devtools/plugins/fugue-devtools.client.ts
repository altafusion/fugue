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
    isDev: import.meta.dev,
    urlConfig: {
      openParams: devtoolsConfig.openParams ?? ['devtools'],
      innerToggleParams: devtoolsConfig.innerToggleParams ?? ['devtoolstoggle'],
    },
    persist: devtoolsConfig.persistNamespace && devtoolsConfig.persistKey
      ? {
          namespace: devtoolsConfig.persistNamespace,
          key: devtoolsConfig.persistKey,
        }
      : undefined,
  })

  nuxtApp.vueApp.provide(DEVTOOLS_INJECTION_KEY, api)
})
