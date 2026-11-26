import type { StorageAPI } from './storageTypes'
import type { DevToolsChromeState, DevToolsPersistedV1 } from './types'
import { createStorage } from './createStorage'
import {
  createDefaultDevToolsChrome,
  DEVTOOLS_PERSIST_VERSION,
  isDevToolsPersistedV1
} from './types'

export * from './types'

export function getDevToolsStorage(namespace: string): StorageAPI {
  return createStorage(namespace)
}

export function readDevToolsPersisted<TDomain>(
  storage: StorageAPI,
  key: string
): DevToolsPersistedV1<TDomain> | null {
  const raw = storage.getItem<DevToolsPersistedV1<TDomain>>(key)
  if (!isDevToolsPersistedV1<TDomain>(raw))
    return null
  return raw
}

export function writeDevToolsPersisted<TDomain>(
  storage: StorageAPI,
  key: string,
  value: DevToolsPersistedV1<TDomain>
): void {
  storage.setItem(key, value)
}

export function readDevToolsChrome(
  storage: StorageAPI,
  key: string,
  isDev = false
): DevToolsChromeState {
  const persisted = readDevToolsPersisted(storage, key)
  if (persisted) {
    return {
      ...createDefaultDevToolsChrome(isDev),
      ...persisted.chrome
    }
  }
  return createDefaultDevToolsChrome(isDev)
}

export function writeDevToolsChrome<TDomain>(
  storage: StorageAPI,
  key: string,
  chrome: DevToolsChromeState,
  domain: TDomain
): void {
  writeDevToolsPersisted(storage, key, {
    v: DEVTOOLS_PERSIST_VERSION,
    chrome,
    domain
  })
}
