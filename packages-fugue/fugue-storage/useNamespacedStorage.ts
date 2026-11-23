import type { RemovableRef, StorageLike, UseStorageOptions } from '@vueuse/core'
import type { MaybeRefOrGetter } from 'vue'
import { useStorage } from '@vueuse/core'
import { formatStorageKey } from './types'

export interface UseNamespacedStorageOptions<T>
  extends Omit<UseStorageOptions<T>, 'serializer'> {}

export function useNamespacedStorage<T>(
  namespace: MaybeRefOrGetter<string>,
  key: MaybeRefOrGetter<string>,
  defaults: MaybeRefOrGetter<T>,
  storage?: StorageLike,
  options?: UseNamespacedStorageOptions<T>
): RemovableRef<T> {
  return useStorage(
    () => {
      const ns = typeof namespace === 'function'
        ? namespace()
        : namespace
      const k = typeof key === 'function'
        ? key()
        : key
      return formatStorageKey(String(ns), String(k))
    },
    defaults,
    storage,
    options
  )
}
