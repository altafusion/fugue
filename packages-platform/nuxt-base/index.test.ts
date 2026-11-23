import { describe, expect, it } from 'vitest'
import { createAppConfig, resolveThemeCss } from './index'

describe('resolveThemeCss', () => {
  it('preserves explicit paths with query or hash', () => {
    expect(resolveThemeCss('~/assets/theme.scss?inline')).toBe('~/assets/theme.scss?inline')
    expect(resolveThemeCss('~/assets/theme.css#x')).toBe('~/assets/theme.css#x')
  })

  it('appends .css when path has no stylesheet extension', () => {
    expect(resolveThemeCss('~/assets/theme')).toBe('~/assets/theme.css')
  })

  it('resolves slug to default theme path', () => {
    expect(resolveThemeCss('default')).toBe('~/assets/css/themes/default-theme.css')
  })
})

describe('createAppConfig eslint merge', () => {
  it('preserves nested eslint.config.stylistic when overriding dev', () => {
    const config = createAppConfig({
      eslint: {
        config: { dev: true },
      },
    }) as {
      eslint: { config: { dev?: boolean, stylistic?: { indent?: number, semi?: boolean } } }
    }
    expect(config.eslint.config.dev).toBe(true)
    expect(config.eslint.config.stylistic).toMatchObject({ indent: 2, semi: false })
  })

  it('merges nested stylistic scalars without dropping sibling keys', () => {
    const config = createAppConfig({
      eslint: {
        config: {
          stylistic: { indent: 4 },
        },
      },
    }) as {
      eslint: { config: { stylistic?: { indent?: number, semi?: boolean, quotes?: string } } }
    }
    expect(config.eslint.config.stylistic).toMatchObject({ indent: 4, semi: false, quotes: 'single' })
  })
})

describe('createAppConfig devtools', () => {
  it('respects boolean devtools overrides', () => {
    expect(createAppConfig({ devtools: false }).devtools).toMatchObject({ enabled: false })
    expect(createAppConfig({ devtools: true }).devtools).toMatchObject({ enabled: true })
  })

  it('respects devtools.enabled object override', () => {
    expect(createAppConfig({
      devtools: { enabled: false },
    }).devtools).toMatchObject({ enabled: false })
  })
})

describe('createAppConfig vite:extendConfig', () => {
  // eslint-disable-next-line no-unused-vars -- `this` types the hook call context
  type ViteExtendHook = (this: unknown, _config: Record<string, unknown>, _context: unknown) => Promise<void>

  it('forwards this to user vite:extendConfig hooks', async () => {
    const ctx = { nuxt: 'instance' }
    let matchesCtx = false
    const config = createAppConfig({
      hooks: {
        'vite:extendConfig': function () {
          matchesCtx = this === ctx
        },
      },
    }) as { hooks: Record<string, unknown> }
    const hook = config.hooks['vite:extendConfig'] as ViteExtendHook
    await hook.call(ctx, {}, {})
    expect(matchesCtx).toBe(true)
  })

  it('leaves server.hmr false', async () => {
    const config = createAppConfig({}) as { hooks: Record<string, unknown> }
    const hook = config.hooks['vite:extendConfig'] as ViteExtendHook
    const viteConfig = {
      server: { hmr: false as const },
    }
    await hook(viteConfig, {})
    expect(viteConfig.server.hmr).toBe(false)
  })

  it('strips port and clientPort from hmr and sets host localhost', async () => {
    const config = createAppConfig({}) as { hooks: Record<string, unknown> }
    const hook = config.hooks['vite:extendConfig'] as ViteExtendHook
    const viteConfig = {
      server: {
        hmr: { port: 25705, clientPort: 25705, protocol: 'ws' },
      },
    }
    await hook(viteConfig, {})
    expect(viteConfig.server.hmr).toEqual({ protocol: 'ws', host: 'localhost' })
  })
})
