export interface StorageAPI {
  readonly namespace: string
  resolveKey: (key: string) => string
  getItem: <T>(key: string) => T | null
  setItem: <T>(key: string, value: T) => void
  removeItem: (key: string) => void
}

/** The part of the Web Storage API the persist helpers use. */
export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export const STORAGE_KEY_SEPARATOR = '::'

/** `{namespace}::{key}` — the localStorage key the persist helpers write. */
export function formatStorageKey(namespace: string, key: string): string {
  return `${namespace}${STORAGE_KEY_SEPARATOR}${key}`
}
