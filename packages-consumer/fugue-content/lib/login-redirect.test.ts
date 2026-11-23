import { describe, expect, it } from 'vitest'
import { resolveFugueContentLoginRedirect } from './login-redirect'

describe('resolveFugueContentLoginRedirect', () => {
  it('accepts same-origin relative paths', () => {
    expect(resolveFugueContentLoginRedirect('/about')).toBe('/about')
    expect(resolveFugueContentLoginRedirect('/about?x=1')).toBe('/about?x=1')
  })

  it('rejects protocol-relative and non-string redirects', () => {
    expect(resolveFugueContentLoginRedirect('//evil.example')).toBe('/')
    expect(resolveFugueContentLoginRedirect('https://evil.example')).toBe('/')
    expect(resolveFugueContentLoginRedirect(undefined, '/home')).toBe('/home')
  })
})
