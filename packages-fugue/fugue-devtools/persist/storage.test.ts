/**
 * @vitest-environment happy-dom
 */
import { beforeEach, describe, expect, it } from 'vitest'
import {
  createDefaultDevToolsChrome,
  DEVTOOLS_PERSIST_VERSION,
  getDevToolsStorage,
  isDevToolsPanelPosition,
  isDevToolsPersistedV1,
  isHorizontalDevToolsDock,
  readDevToolsChrome,
  readDevToolsPersisted,
  writeDevToolsChrome,
  writeDevToolsPersisted,
} from './index'

describe('persist guards', () => {
  it('accepts the four dock positions only', () => {
    for (const position of ['top', 'right', 'bottom', 'left'])
      expect(isDevToolsPanelPosition(position)).toBe(true)
    expect(isDevToolsPanelPosition('center')).toBe(false)
    expect(isDevToolsPanelPosition(undefined)).toBe(false)
  })

  it('treats top and bottom as horizontal docks', () => {
    expect(isHorizontalDevToolsDock('top')).toBe(true)
    expect(isHorizontalDevToolsDock('bottom')).toBe(true)
    expect(isHorizontalDevToolsDock('left')).toBe(false)
    expect(isHorizontalDevToolsDock('right')).toBe(false)
  })

  it('validates the persisted blob shape', () => {
    const chrome = createDefaultDevToolsChrome()
    expect(isDevToolsPersistedV1({ v: DEVTOOLS_PERSIST_VERSION, chrome, domain: {} })).toBe(true)
    expect(isDevToolsPersistedV1({ v: 2, chrome, domain: {} })).toBe(false)
    expect(isDevToolsPersistedV1({ v: 1, chrome, domain: null })).toBe(false)
    expect(isDevToolsPersistedV1({ v: 1, domain: {} })).toBe(false)
    expect(isDevToolsPersistedV1(null)).toBe(false)
    expect(isDevToolsPersistedV1('nope')).toBe(false)
  })

  it('defaults to a closed bottom dock, with the inner toggle on in dev', () => {
    expect(createDefaultDevToolsChrome()).toEqual({
      enabled: false,
      open: false,
      panelPosition: 'bottom',
      innerToggle: false,
    })
    expect(createDefaultDevToolsChrome(true).innerToggle).toBe(true)
  })
})

describe('persist storage helpers', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('writes the { v, chrome, domain } blob under namespace::key', () => {
    const storage = getDevToolsStorage('app')
    const chrome = {
      enabled: true,
      open: true,
      panelPosition: 'left' as const,
      innerToggle: false,
    }
    writeDevToolsChrome(storage, 'devtools', chrome, { flag: 1 })
    expect(JSON.parse(localStorage.getItem('app::devtools')!)).toEqual({
      v: 1,
      chrome,
      domain: { flag: 1 },
    })
  })

  it('round-trips the persisted blob', () => {
    const storage = getDevToolsStorage('app')
    const blob = {
      v: 1 as const,
      chrome: createDefaultDevToolsChrome(),
      domain: { a: true },
    }
    writeDevToolsPersisted(storage, 'devtools', blob)
    expect(readDevToolsPersisted(storage, 'devtools')).toEqual(blob)
  })

  it('returns null for a missing or invalid blob', () => {
    const storage = getDevToolsStorage('app')
    expect(readDevToolsPersisted(storage, 'devtools')).toBeNull()
    localStorage.setItem('app::devtools', JSON.stringify({ v: 9 }))
    expect(readDevToolsPersisted(storage, 'devtools')).toBeNull()
    localStorage.setItem('app::devtools', 'not json')
    expect(readDevToolsPersisted(storage, 'devtools')).toBeNull()
  })

  it('restores saved chrome and falls back to defaults when nothing is saved', () => {
    const storage = getDevToolsStorage('app')
    expect(readDevToolsChrome(storage, 'devtools', true)).toEqual(createDefaultDevToolsChrome(true))
    writeDevToolsChrome(storage, 'devtools', {
      enabled: true,
      open: true,
      panelPosition: 'top',
      innerToggle: true,
    }, {})
    expect(readDevToolsChrome(storage, 'devtools')).toEqual({
      enabled: true,
      open: true,
      panelPosition: 'top',
      innerToggle: true,
    })
  })
})
