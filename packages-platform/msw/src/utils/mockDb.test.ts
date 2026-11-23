import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { __resetMockDbStateForTests, initMockDb, resetMockDb, resolveMockDbMode } from './mockDb'

const NS = 'test-app'
const KEY = 'items'

describe('resolveMockDbMode', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('defaults invalid or unset to tab', () => {
    expect(resolveMockDbMode(undefined)).toBe('tab')
    expect(resolveMockDbMode('')).toBe('tab')
    expect(resolveMockDbMode('tab')).toBe('tab')
    expect(resolveMockDbMode('invalid')).toBe('tab')
  })

  it('returns shared for shared', () => {
    expect(resolveMockDbMode('shared')).toBe('shared')
    expect(resolveMockDbMode(' shared ')).toBe('shared')
  })
})

describe('initMockDb', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    vi.unstubAllEnvs()
    __resetMockDbStateForTests()
  })

  afterEach(() => {
    resetMockDb(NS, KEY)
  })

  it('persists mutations in sessionStorage (tab mode)', () => {
    vi.stubEnv('VITE_MSW_MOCK_DB', 'tab')
    const items = initMockDb(NS, KEY, [
      { id: '1' },
    ])
    items.push({ id: '2' })

    const reloaded = initMockDb(NS, KEY, [
      { id: '1' },
    ])
    expect(reloaded).toHaveLength(2)
    expect(reloaded[1]).toEqual({ id: '2' })
  })

  it('resets when seed data changes', () => {
    vi.stubEnv('VITE_MSW_MOCK_DB', 'tab')
    initMockDb(NS, KEY, [
      { id: '1' },
    ])
    const fresh = initMockDb(NS, KEY, [
      { id: 'a' },
    ])
    expect(fresh).toHaveLength(1)
    expect(fresh[0]).toEqual({ id: 'a' })
  })

  it('tab mode uses sessionStorage', () => {
    vi.stubEnv('VITE_MSW_MOCK_DB', 'tab')
    const db = initMockDb(NS, 'tab-key', [
      { id: 1 },
    ])
    db.push({ id: 2 })

    expect(sessionStorage.getItem(`${NS}::mock-db::tab-key`)).toContain('"id":2')
    expect(localStorage.getItem(`${NS}::mock-db::tab-key`)).toBeNull()
  })

  it('shared mode uses localStorage', () => {
    vi.stubEnv('VITE_MSW_MOCK_DB', 'shared')
    const db = initMockDb(NS, 'shared-key', [
      { id: 1 },
    ])
    db.push({ id: 2 })

    expect(localStorage.getItem(`${NS}::mock-db::shared-key`)).toContain('"id":2')
    expect(sessionStorage.getItem(`${NS}::mock-db::shared-key`)).toBeNull()
  })

  it('clears stale cache when seed data changes', () => {
    vi.stubEnv('VITE_MSW_MOCK_DB', 'tab')
    const db1 = initMockDb(NS, 'hash-key', [
      { id: 1 },
    ])
    db1.push({ id: 99 })

    const db2 = initMockDb(NS, 'hash-key', [
      { id: 1 },
      { id: 2 },
    ])
    expect(db2).toHaveLength(2)
    expect(db2.some(item => item.id === 99)).toBe(false)
  })

  it('shared mode rehydrates a second initMockDb instance after push', () => {
    vi.stubEnv('VITE_MSW_MOCK_DB', 'shared')

    const channels: Array<{ onmessage: ((_event: MessageEvent<{ key?: string }>) => void) | null }> = []
    const OriginalBroadcastChannel = globalThis.BroadcastChannel
    globalThis.BroadcastChannel = class {
      onmessage: ((_event: MessageEvent<{ key?: string }>) => void) | null = null
      constructor(_name: string) {
        channels.push(this)
      }

      postMessage(data: { key?: string }) {
        for (const channel of channels)
          channel.onmessage?.({ data } as MessageEvent<{ key?: string }>)
      }

      close() {}
    } as unknown as typeof BroadcastChannel

    try {
      const a = initMockDb(NS, 'sync-key', [
        { id: 1 },
      ])
      const b = initMockDb(NS, 'sync-key', [
        { id: 1 },
      ])

      a.push({ id: 2 })

      expect(b).toHaveLength(2)
      expect(b[1]).toEqual({ id: 2 })
    } finally {
      globalThis.BroadcastChannel = OriginalBroadcastChannel
    }
  })

  it('shared mode broadcasts on push', () => {
    vi.stubEnv('VITE_MSW_MOCK_DB', 'shared')
    const postMessage = vi.fn()
    const OriginalBroadcastChannel = globalThis.BroadcastChannel
    globalThis.BroadcastChannel = class {
      onmessage: ((_event: MessageEvent) => void) | null = null
      postMessage = postMessage
      close() {}
    } as unknown as typeof BroadcastChannel

    try {
      initMockDb(NS, 'broadcast-key', [
        { id: 1 },
      ]).push({ id: 2 })
      expect(postMessage).toHaveBeenCalledWith({ key: `${NS}::mock-db::broadcast-key` })
    } finally {
      globalThis.BroadcastChannel = OriginalBroadcastChannel
    }
  })
})

describe('resetMockDb', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    vi.unstubAllEnvs()
    __resetMockDbStateForTests()
  })

  it('clears both sessionStorage and localStorage', () => {
    const itemKey = `${NS}::mock-db::reset-key`
    const hashKey = `${NS}::mock-db::reset-key::hash`
    sessionStorage.setItem(itemKey, '[]')
    sessionStorage.setItem(hashKey, '[]')
    localStorage.setItem(itemKey, '[]')
    localStorage.setItem(hashKey, '[]')

    resetMockDb(NS, 'reset-key')

    expect(sessionStorage.getItem(itemKey)).toBeNull()
    expect(sessionStorage.getItem(hashKey)).toBeNull()
    expect(localStorage.getItem(itemKey)).toBeNull()
    expect(localStorage.getItem(hashKey)).toBeNull()
  })
})
