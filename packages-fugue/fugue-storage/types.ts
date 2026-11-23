export interface StorageAPI {
  readonly namespace: string
  resolveKey(key: string): string
  getItem<T>(key: string): T | null
  setItem<T>(key: string, value: T): void
  removeItem(key: string): void
}

export const STORAGE_KEY_SEPARATOR = '::'

/** `{namespace}::{key}` — used by `@altafusion/fugue-devtools` persist helpers. */
export function formatStorageKey(namespace: string, key: string): string {
  return `${namespace}${STORAGE_KEY_SEPARATOR}${key}`
}
