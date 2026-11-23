/**
 * @vitest-environment happy-dom
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { createStorage, formatStorageKey } from './index'

describe('formatStorageKey', () => {
  it('joins namespace and key with ::', () => {
    expect(formatStorageKey('altafusion', 'devtools')).toBe('altafusion::devtools')
  })
})

describe('createStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('reads and writes JSON values under namespaced keys', () => {
    const storage = createStorage('app')
    storage.setItem('prefs', { theme: 'dark', count: 2 })
    expect(localStorage.getItem('app::prefs')).toBe(JSON.stringify({ theme: 'dark', count: 2 }))
    expect(storage.getItem<{ theme: string, count: number }>('prefs')).toEqual({
      theme: 'dark',
      count: 2
    })
  })

  it('returns null for missing keys', () => {
    const storage = createStorage('app')
    expect(storage.getItem('missing')).toBeNull()
  })

  it('removeItem deletes the namespaced entry', () => {
    const storage = createStorage('app')
    storage.setItem('flag', true)
    storage.removeItem('flag')
    expect(localStorage.getItem('app::flag')).toBeNull()
  })

  it('resolveKey exposes the full localStorage key', () => {
    const storage = createStorage('cms')
    expect(storage.resolveKey('draft')).toBe('cms::draft')
  })
})
