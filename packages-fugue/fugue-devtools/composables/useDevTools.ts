import type { Router } from 'vue-router'
import type { DevToolsApi, DevToolsChromeState, DevToolsPersistConfig, DevToolsPublicConfig } from '#devtools/composables/devtoolsTypes'
import {
  getDevToolsStorage,
  readDevToolsPersisted,
  writeDevToolsPersisted,
} from '@altafusion/fugue-devtools-persist'
import { computed, inject, ref, watch } from 'vue'
import { createDefaultDevToolsChrome, DEVTOOLS_INJECTION_KEY } from '#devtools/composables/devtoolsTypes'
import { readDevToolsUrlActivation, stripDevToolsOpenParams } from '#devtools/utils/devtoolsUrlActivation'

export function createDevToolsApi(options: {
  router: Router
  isDev: boolean
  urlConfig: DevToolsPublicConfig
  initialChrome?: Partial<DevToolsChromeState>
  persist?: DevToolsPersistConfig
}): DevToolsApi {
  const { router, isDev, urlConfig, persist } = options
  const route = useRoute()

  const urlActivation = computed(() => readDevToolsUrlActivation(route.query, urlConfig))

  const storage = persist
    ? getDevToolsStorage(persist.namespace)
    : null
  const persistedDomain = persist && storage
    ? readDevToolsPersisted<Record<string, unknown>>(storage, persist.key)?.domain ?? {}
    : {}

  const chrome = ref<DevToolsChromeState>({
    ...createDefaultDevToolsChrome(isDev),
    ...(persist && storage
      ? readDevToolsPersisted(storage, persist.key)?.chrome
      : undefined),
    ...options.initialChrome,
  })

  const showPanel = computed(
    () => chrome.value.enabled || urlActivation.value.enabledFromUrl,
  )

  function applyUrlActivation() {
    const { enabledFromUrl, hasInnerToggleParam } = urlActivation.value
    if (!enabledFromUrl)
      return
    chrome.value = {
      ...chrome.value,
      enabled: true,
      innerToggle: hasInnerToggleParam || isDev
        ? true
        : chrome.value.innerToggle,
    }
  }

  watch(urlActivation, applyUrlActivation, { immediate: true, deep: true })
  watch(() => route.fullPath, applyUrlActivation)

  if (persist && storage) {
    watch(
      chrome,
      (next) => {
        const existing = readDevToolsPersisted<Record<string, unknown>>(storage, persist.key)
        writeDevToolsPersisted(storage, persist.key, {
          v: 1,
          chrome: next,
          domain: existing?.domain ?? persistedDomain,
        })
      },
      { deep: true },
    )
  }

  function updateChrome<K extends keyof DevToolsChromeState>(key: K, value: DevToolsChromeState[K]) {
    chrome.value = { ...chrome.value, [key]: value }
  }

  function disable() {
    chrome.value = { ...chrome.value, enabled: false }
    if (!urlActivation.value.enabledFromUrl)
      return

    const query = stripDevToolsOpenParams({ ...route.query }, urlConfig) as typeof route.query
    router.replace({ path: route.path, query, hash: route.hash })
  }

  function enable() {
    chrome.value = { ...chrome.value, enabled: true }
  }

  return {
    chrome,
    showPanel,
    updateChrome,
    disable,
    enable,
  }
}

export function useDevTools(): DevToolsApi {
  const api = inject(DEVTOOLS_INJECTION_KEY)
  if (!api)
    throw new Error('useDevTools must be used after the fugue-devtools plugin is registered')
  return api
}
