import type { Serializer, StorageLike } from '@vueuse/core'
import type { StorageAPI } from './types'
import { StorageSerializers } from '@vueuse/core'
import { formatStorageKey } from './types'

function getDefaultStorage(): StorageLike | null {
  if (typeof localStorage === 'undefined')
    return null
  return localStorage
}

function readSerialized<T>(
  storage: StorageLike,
  fullKey: string,
  serializer: Serializer<T>
): T | null {
  try {
    const raw = storage.getItem(fullKey)
    if (raw == null)
      return null
    return serializer.read(raw)
  } catch {
    return null
  }
}

function writeSerialized<T>(
  storage: StorageLike,
  fullKey: string,
  value: T,
  serializer: Serializer<T>
): void {
  try {
    if (value == null)
      storage.removeItem(fullKey)
    else
      storage.setItem(fullKey, serializer.write(value))
  } catch {
    // quota, private mode, SSR — ignore
  }
}

export function createStorage(
  namespace: string,
  storage: StorageLike | null = getDefaultStorage()
): StorageAPI {
  const serializer = StorageSerializers.object as Serializer<unknown>

  return {
    namespace,

    resolveKey(key: string) {
      return formatStorageKey(namespace, key)
    },

    getItem<T>(key: string): T | null {
      if (!storage)
        return null
      return readSerialized(storage, formatStorageKey(namespace, key), serializer) as T | null
    },

    setItem<T>(key: string, value: T): void {
      if (!storage)
        return
      writeSerialized(storage, formatStorageKey(namespace, key), value, serializer)
    },

    removeItem(key: string): void {
      if (!storage)
        return
      try {
        storage.removeItem(formatStorageKey(namespace, key))
      } catch {
        // ignore
      }
    }
  }
}
