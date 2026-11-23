import { describe, expect, it } from 'vitest'
import { defineFugueContentSite, resolveFugueSimpleAuthLayer, studioPublicPrefixes, studioViteOptimizeDeps } from './define-site'
import { fugueContentAuthSection } from './site-config-registry'

describe('fugueContentAuthSection', () => {
  it('defaults envPrefix to SITE and routes mode', () => {
    expect(fugueContentAuthSection().auth).toMatchObject({
      envPrefix: 'SITE',
      mode: 'routes',
      cookieName: 'site-auth',
      sessionLabel: 'site-authenticated'
    })
  })

  it('uses cookieSlug for session cookie when set', () => {
    expect(fugueContentAuthSection({ cookieSlug: 'my-site' }).auth).toMatchObject({
      envPrefix: 'SITE',
      cookieName: 'my-site-auth',
      sessionLabel: 'my-site-authenticated'
    })
  })
})

describe('defineFugueContentSite', () => {
  it('extends the cms consumer stack', () => {
    const config = defineFugueContentSite({}, { enableNuxtUI: true, theme: 'demo' })

    expect(config.extends).toEqual([
      '@altafusion/fugue-theme',
      '@altafusion/shell',
      '@altafusion/fugue-content'
    ])
    expect(config.runtimeConfig?.public?.hasNuxtUI).toBe(true)
    expect(config.runtimeConfig?.public?.theme).toBe('demo')
  })

  it('extends fugue-simple-auth and protects studio routes in routes mode when auth and studio are set', () => {
    const prev = process.env.MY_SITE_ACCESS_KEY
    process.env.MY_SITE_ACCESS_KEY = 'test-key'

    try {
      const config = defineFugueContentSite({
        authMode: 'peek',
        auth: {
          envPrefix: 'MY_SITE',
          loginDescription: 'Enter the access key to open the editor.'
        },
        studio: {
          repository: {
            owner: 'altafusion',
            repo: 'altafusion-monorepo',
            rootDir: 'apps/my-site'
          },
          editors: { provider: 'google' }
        }
      })

      expect(config.extends).toEqual([
        '@altafusion/fugue-theme',
        '@altafusion/shell',
        resolveFugueSimpleAuthLayer(),
        '@altafusion/fugue-content'
      ])
      expect(config.runtimeConfig?.public?.fugueContent).toEqual({ authMode: 'peek' })
      expect(config.runtimeConfig?.public?.fugueSimpleAuth).toMatchObject({
        envPrefix: 'MY_SITE',
        mode: 'routes',
        cookieName: 'my-site-auth',
        sessionLabel: 'my-site-authenticated',
        loginDescription: 'Enter the access key to open the editor.',
        protectedRoutes: ['/_studio', '/_studio/**', '/__nuxt_studio/**'],
        publicPrefixes: [
          '/_nuxt/',
          '/__nuxt/'
        ]
      })
      expect(config.studio).toMatchObject({
        route: '/_studio',
        repository: {
          rootDir: 'apps/my-site'
        }
      })
      expect(config.vite?.optimizeDeps?.include).toEqual(expect.arrayContaining([...studioViteOptimizeDeps]))
    } finally {
      if (prev === undefined)
        delete process.env.MY_SITE_ACCESS_KEY
      else
        process.env.MY_SITE_ACCESS_KEY = prev
    }
  })

  it('skips fugue-simple-auth when authMode is studio even if peek env is set', () => {
    const prev = process.env.SITE_ACCESS_KEY
    process.env.SITE_ACCESS_KEY = 'legacy-key'

    try {
      const config = defineFugueContentSite({
        authMode: 'studio',
        auth: {
          envPrefix: 'SITE'
        },
        studio: {
          repository: {
            owner: 'altafusion',
            repo: 'altafusion-monorepo',
            rootDir: 'apps/my-site'
          }
        }
      })

      expect(config.extends).not.toContain(resolveFugueSimpleAuthLayer())
      expect(config.runtimeConfig?.public?.fugueContent).toEqual({ authMode: 'studio' })
      expect(config.runtimeConfig?.public?.fugueSimpleAuth).toBeUndefined()
    } finally {
      if (prev === undefined)
        delete process.env.SITE_ACCESS_KEY
      else
        process.env.SITE_ACCESS_KEY = prev
    }
  })

  it('matches Pilot manifest — studio auth without fugue layer or login route', () => {
    const config = defineFugueContentSite({
      authMode: 'studio',
      studio: {
        repository: {
          owner: 'altafusion',
          repo: 'altafusion-monorepo',
          rootDir: 'apps/my-site'
        },
        editors: { provider: 'google' }
      }
    })

    expect(config.extends).not.toContain(resolveFugueSimpleAuthLayer())
    expect(config.runtimeConfig?.public?.fugueContent).toEqual({ authMode: 'studio' })
    expect(config.runtimeConfig?.public?.fugueSimpleAuth).toBeUndefined()
    expect(config.studio?.route).toBe('/_studio')
  })

  it('keeps studio bypass prefixes in full peek mode', () => {
    const prev = process.env.SITE_ACCESS_KEY
    process.env.SITE_ACCESS_KEY = 'test-key'

    try {
      const config = defineFugueContentSite({
        authMode: 'peek',
        auth: {
          envPrefix: 'SITE',
          mode: 'full'
        },
        studio: {
          repository: {
            owner: 'altafusion',
            repo: 'altafusion-monorepo',
            rootDir: 'apps/my-site'
          }
        }
      })

      expect(config.runtimeConfig?.public?.fugueContent).toEqual({ authMode: 'peek' })
      expect(config.runtimeConfig?.public?.fugueSimpleAuth).toMatchObject({
        mode: 'full',
        publicPrefixes: [
          '/_nuxt/',
          '/__nuxt/',
          ...studioPublicPrefixes
        ]
      })
    } finally {
      if (prev === undefined)
        delete process.env.SITE_ACCESS_KEY
      else
        process.env.SITE_ACCESS_KEY = prev
    }
  })

  it('does not add studio bypass prefixes when auth is set without studio', () => {
    const prev = process.env.MY_SITE_ACCESS_KEY
    process.env.MY_SITE_ACCESS_KEY = 'test-key'

    try {
      const config = defineFugueContentSite({
        authMode: 'peek',
        auth: { envPrefix: 'MY_SITE' }
      })

      expect(config.extends).toContain(resolveFugueSimpleAuthLayer())
      expect(config.runtimeConfig?.public?.fugueSimpleAuth?.publicPrefixes).toEqual([
        '/_nuxt/',
        '/__nuxt/'
      ])
      expect(config.vite?.optimizeDeps?.include).toBeUndefined()
    } finally {
      if (prev === undefined)
        delete process.env.MY_SITE_ACCESS_KEY
      else
        process.env.MY_SITE_ACCESS_KEY = prev
    }
  })

  it('merges studio config without fugue when auth mode resolves to studio', () => {
    const prev = process.env.SITE_AUTH_ENABLED
    process.env.SITE_AUTH_ENABLED = 'true'

    try {
      const config = defineFugueContentSite({
        authMode: 'studio',
        studio: {
          repository: {
            owner: 'altafusion',
            repo: 'altafusion-monorepo',
            rootDir: 'apps/my-site'
          }
        }
      })

      expect(config.extends).not.toContain(resolveFugueSimpleAuthLayer())
      expect(config.runtimeConfig?.public?.fugueContent).toEqual({ authMode: 'studio' })
      expect(config.runtimeConfig?.public?.fugueSimpleAuth).toBeUndefined()
      expect(config.studio).toMatchObject({
        route: '/_studio',
        repository: { rootDir: 'apps/my-site' }
      })
      expect(config.routeRules?.['/**']).toEqual({ ssr: true, prerender: false })
    } finally {
      if (prev === undefined)
        delete process.env.SITE_AUTH_ENABLED
      else
        process.env.SITE_AUTH_ENABLED = prev
    }
  })

  it('merges studio config and vite optimizeDeps when studio is set', () => {
    const config = defineFugueContentSite({
      studio: {
        repository: {
          owner: 'altafusion',
          repo: 'altafusion-monorepo',
          rootDir: 'templates/fugue-content-site'
        },
        editors: { provider: 'google' },
        git: {
          commit: { messagePrefix: 'content(fugue-content-site):' }
        }
      }
    })

    expect(config.studio).toMatchObject({
      route: '/_studio',
      repository: {
        provider: 'github',
        owner: 'altafusion',
        repo: 'altafusion-monorepo',
        branch: 'main',
        rootDir: 'templates/fugue-content-site'
      },
      git: {
        commit: { messagePrefix: 'content(fugue-content-site):' }
      }
    })
    expect(config.vite?.optimizeDeps?.include).toEqual(expect.arrayContaining([...studioViteOptimizeDeps]))
    expect(config.vite?.optimizeDeps?.noDiscovery).toBe(true)
    expect(config.build?.transpile).toContain('nuxt-studio')
  })

  it('appends extraExtends after the default cms stack', () => {
    const config = defineFugueContentSite({
      extraExtends: ['./theme']
    })

    expect(config.extends).toEqual([
      '@altafusion/fugue-theme',
      '@altafusion/shell',
      '@altafusion/fugue-content',
      './theme'
    ])
  })

  it('merges default i18n options when locales are configured', () => {
    const config = defineFugueContentSite({
      i18n: {
        defaultLocale: 'en',
        locales: [
          { code: 'en', file: 'en.yaml' },
          { code: 'es', file: 'es.yaml' }
        ]
      }
    })

    expect(config.i18n).toMatchObject({
      strategy: 'prefix_except_default',
      defaultLocale: 'en',
      langDir: 'locales',
      detectBrowserLanguage: false,
      locales: [
        { code: 'en', file: 'en.yaml' },
        { code: 'es', file: 'es.yaml' }
      ]
    })
  })
})
