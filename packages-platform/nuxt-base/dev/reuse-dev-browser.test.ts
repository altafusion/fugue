import { describe, expect, it } from 'vitest'
import { resolveDevOpenUrl } from './reuse-dev-browser'

describe('resolveDevOpenUrl', () => {
  it('prefers devServer.url from nuxt config over listener default', () => {
    const nuxt = {
      options: {
        devServer: { url: 'http://localhost:7002' },
      },
    }
    expect(resolveDevOpenUrl(nuxt as never, { url: 'http://localhost:3000/' }))
      .toBe('http://localhost:7002')
  })

  it('falls back to listener url when devServer.url is unset', () => {
    const nuxt = {
      options: { devServer: {} },
    }
    expect(resolveDevOpenUrl(nuxt as never, { url: 'http://127.0.0.1:7001/' }))
      .toBe('http://127.0.0.1:7001/')
  })
})
