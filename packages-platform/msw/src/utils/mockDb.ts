const MOCK_DB_BROADCAST_CHANNEL = 'altafusion-msw-mock-db'

export type MockDbMode = 'tab' | 'shared'

/** `tab` (default) or `shared` from `VITE_MSW_MOCK_DB`; pass `raw` in tests. */
export function resolveMockDbMode(raw?: string): MockDbMode {
  const value = (raw ?? (import.meta.env?.VITE_MSW_MOCK_DB as string | undefined))?.trim()
  return value === 'shared'
    ? 'shared'
    : 'tab'
}

function storageKey(namespace: string, key: string) {
  return `${namespace}::mock-db::${key}`
}

function storageHashKey(namespace: string, key: string) {
  return `${namespace}::mock-db::${key}::hash`
}

function mockDbStorage(mode: MockDbMode): Storage | undefined {
  if (typeof window === 'undefined')
    return undefined
  return mode === 'shared'
    ? window.localStorage
    : window.sessionStorage
}

let applyingFromPeer = false
let broadcastChannel: BroadcastChannel | undefined
const peerTargets = new Map<string, Set<unknown[]>>()

function ensureBroadcastListener(storage: Storage | undefined) {
  if (broadcastChannel || typeof BroadcastChannel === 'undefined')
    return

  broadcastChannel = new BroadcastChannel(MOCK_DB_BROADCAST_CHANNEL)
  broadcastChannel.onmessage = (event: MessageEvent<{ key?: string }>) => {
    const itemKey = event.data?.key
    if (!itemKey)
      return

    const targets = peerTargets.get(itemKey)
    if (!targets?.size)
      return

    const raw = storage?.getItem(itemKey)
    if (!raw)
      return

    try {
      const next = JSON.parse(raw) as unknown[]
      applyingFromPeer = true
      for (const target of targets)
        target.splice(0, target.length, ...next)
    } finally {
      applyingFromPeer = false
    }
  }
}

function registerPeerTarget(itemKey: string, target: unknown[], mode: MockDbMode, storage: Storage | undefined) {
  if (mode !== 'shared')
    return

  let targets = peerTargets.get(itemKey)
  if (!targets) {
    targets = new Set()
    peerTargets.set(itemKey, targets)
  }
  targets.add(target)
  ensureBroadcastListener(storage)
}

function persistMockDb(
  itemKey: string,
  hashKey: string,
  currentHash: string,
  target: unknown[],
  mode: MockDbMode,
  storage: Storage | undefined,
) {
  storage?.setItem(itemKey, JSON.stringify(target))
  storage?.setItem(hashKey, currentHash)

  if (mode === 'shared' && !applyingFromPeer && typeof BroadcastChannel !== 'undefined') {
    ensureBroadcastListener(storage)
    broadcastChannel?.postMessage({ key: itemKey })
  }
}

export interface InitMockDbOptions {
  mode?: MockDbMode
}

/**
 * Mutable array for MSW handlers with optional browser persistence.
 *
 * - **`tab`** (default): `sessionStorage`; isolated per browser tab.
 * - **`shared`**: `localStorage` + `BroadcastChannel` rehydrate in other tabs.
 *
 * Resets when seed data changes (content hash), not merely length.
 */
export function initMockDb<T>(
  namespace: string,
  key: string,
  seedData: T[],
  options?: InitMockDbOptions,
) {
  const mode = options?.mode ?? resolveMockDbMode()
  const storage = mockDbStorage(mode)
  const itemKey = storageKey(namespace, key)
  const hashKey = storageHashKey(namespace, key)
  const currentHash = JSON.stringify(seedData)
  let items: T[] = seedData

  const existingItems = storage?.getItem(itemKey)
  const existingHash = storage?.getItem(hashKey)

  if (existingItems && existingHash === currentHash) {
    items = JSON.parse(existingItems) as T[]
  } else {
    storage?.removeItem(itemKey)
    storage?.removeItem(hashKey)
  }

  storage?.setItem(itemKey, JSON.stringify(items))
  storage?.setItem(hashKey, currentHash)

  registerPeerTarget(itemKey, items as unknown[], mode, storage)

  return new Proxy(items, {
    get(target, property, receiver) {
      switch (property) {
        case 'push':
          return (...args: Parameters<typeof items.push>) => {
            const result = target.push(...args)
            persistMockDb(itemKey, hashKey, currentHash, target as unknown[], mode, storage)
            return result
          }
        case 'splice':
          return (...args: Parameters<typeof items.splice>) => {
            const result = target.splice(...args)
            persistMockDb(itemKey, hashKey, currentHash, target as unknown[], mode, storage)
            return result
          }
        default:
          return Reflect.get(target, property, receiver)
      }
    },
  })
}

export function generateMockId(length: number): string {
  let id = ''
  for (let i = 0; i < length; i++)
    id += Math.floor(Math.random() * 10).toString()
  return id
}

export function resetMockDb(namespace: string, key: string) {
  if (typeof window === 'undefined')
    return

  const itemKey = storageKey(namespace, key)
  const hashKey = storageHashKey(namespace, key)

  window.sessionStorage.removeItem(itemKey)
  window.sessionStorage.removeItem(hashKey)
  window.localStorage.removeItem(itemKey)
  window.localStorage.removeItem(hashKey)
}

/** @internal */
export function __resetMockDbStateForTests() {
  applyingFromPeer = false
  peerTargets.clear()
  broadcastChannel?.close()
  broadcastChannel = undefined
}
