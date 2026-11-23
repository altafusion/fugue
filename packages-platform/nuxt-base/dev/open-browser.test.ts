import { describe, expect, it } from 'vitest'
import { normalizeDevOpenUrl, resolveOpenedChromiumBrowser } from './open-browser'

describe('normalizeDevOpenUrl', () => {
  it('strips trailing slash from path', () => {
    expect(normalizeDevOpenUrl('http://localhost:7003/')).toBe('http://localhost:7003')
    expect(normalizeDevOpenUrl('http://localhost:7003/app/')).toBe('http://localhost:7003/app')
  })

  it('preserves root path', () => {
    expect(normalizeDevOpenUrl('http://localhost:7003')).toBe('http://localhost:7003')
  })
})

describe('resolveOpenedChromiumBrowser', () => {
  it('normalizes explicit google chrome', () => {
    expect(resolveOpenedChromiumBrowser('google chrome', '')).toBe('Google Chrome')
    expect(resolveOpenedChromiumBrowser('  Google Chrome  ', '')).toBe('Google Chrome')
  })

  it('maps common browser aliases', () => {
    expect(resolveOpenedChromiumBrowser('chrome', '')).toBe('Google Chrome')
    expect(resolveOpenedChromiumBrowser('edge', '')).toBe('Microsoft Edge')
    expect(resolveOpenedChromiumBrowser('microsoft edge', '')).toBe('Microsoft Edge')
    expect(resolveOpenedChromiumBrowser('brave', '')).toBe('Brave Browser')
    expect(resolveOpenedChromiumBrowser('brave browser', '')).toBe('Brave Browser')
  })

  it('returns undefined for explicit non-Chromium preference', () => {
    expect(resolveOpenedChromiumBrowser('safari', 'Google Chrome')).toBeUndefined()
    expect(resolveOpenedChromiumBrowser('Firefox', '')).toBeUndefined()
  })

  it('ignores inherited object keys as browser aliases', () => {
    expect(resolveOpenedChromiumBrowser('constructor', '')).toBeUndefined()
    expect(resolveOpenedChromiumBrowser('toString', '')).toBeUndefined()
  })

  it('detects Chromium from ps stdout when browser env unset', () => {
    const ps = '123 Google Chrome\n456 Safari'
    expect(resolveOpenedChromiumBrowser(undefined, ps)).toBe('Google Chrome')
  })

  it('returns undefined when ps stdout has no supported browser', () => {
    expect(resolveOpenedChromiumBrowser(undefined, '123 Safari\n456 Firefox')).toBeUndefined()
  })
})
