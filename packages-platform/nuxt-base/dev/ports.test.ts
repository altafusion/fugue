import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { devPorts, devViteServerOptions, linkedCheckoutRoot, pinDevServerHmr, siteDevPort, templateDevPorts, templateViteServerOptions } from './ports'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '../../..')

describe('devPorts registry', () => {
  it('matches nuxt-dev.mjs launcher map for Nuxt apps', () => {
    const mjs = readFileSync(join(here, 'nuxt-dev.mjs'), 'utf8')
    const nuxtAppKeys = [
      'developerDocs',
      'pickup',
    ] as const
    for (const key of nuxtAppKeys) {
      expect(mjs).toContain(`${key}: ${devPorts[key]}`)
    }
  })
})

describe('templateDevPorts registry', () => {
  it('matches template dev.mjs launcher defaults', () => {
    const cmsDev = readFileSync(join(repoRoot, 'templates/fugue-content-site/scripts/dev.mjs'), 'utf8')
    const docusDev = readFileSync(join(repoRoot, 'templates/docus-site/scripts/dev.mjs'), 'utf8')
    expect(cmsDev).toContain(`|| ${templateDevPorts.fugueContentSite}`)
    expect(docusDev).toContain(`|| ${templateDevPorts.docusSite}`)
  })

  it('does not overlap app devPorts', () => {
    const appHttp = new Set<number>(Object.values(devPorts))
    for (const port of Object.values(templateDevPorts)) {
      expect(appHttp.has(port)).toBe(false)
    }
  })
})

describe('devViteServerOptions', () => {
  const expected = {
    host: 'localhost',
    strictPort: true,
    hmr: { host: 'localhost' },
  }

  it('returns expected vite server opts, plus the checkout in fs.allow when linked from one', () => {
    // These tests run from the Fugue checkout itself, which is the linked case.
    expect(devViteServerOptions()).toEqual({
      ...expected,
      fs: {
        allow: [repoRoot],
      },
    })
  })

  it('templateViteServerOptions deep-equals devViteServerOptions', () => {
    expect(templateViteServerOptions()).toEqual(devViteServerOptions())
  })
})

describe('linkedCheckoutRoot', () => {
  it('is the Fugue checkout when the package runs from one', () => {
    expect(linkedCheckoutRoot(here)).toBe(repoRoot)
  })

  it('is null when the package is installed under node_modules', () => {
    expect(linkedCheckoutRoot(join(repoRoot, 'node_modules/@altafusion/nuxt-base/dev'))).toBeNull()
  })

  it('is null when the folder three levels up is not a pnpm workspace', () => {
    expect(linkedCheckoutRoot(join(here, 'no-workspace-here/a/b'))).toBeNull()
  })
})

describe('pinDevServerHmr', () => {
  it('strips port and clientPort and sets host localhost', () => {
    const server = {
      hmr: { port: 25705, clientPort: 25705, protocol: 'ws' },
    }
    pinDevServerHmr(server)
    expect(server.hmr).toEqual({ protocol: 'ws', host: 'localhost' })
  })

  it('leaves hmr false unchanged', () => {
    const server = { hmr: false as const }
    pinDevServerHmr(server)
    expect(server.hmr).toBe(false)
  })
})

describe('siteDevPort', () => {
  const fallback = 7003
  const savedSiteDevPort = process.env.SITE_DEV_PORT
  const savedPort = process.env.PORT

  afterEach(() => {
    if (savedSiteDevPort === undefined)
      delete process.env.SITE_DEV_PORT
    else
      process.env.SITE_DEV_PORT = savedSiteDevPort
    if (savedPort === undefined)
      delete process.env.PORT
    else
      process.env.PORT = savedPort
  })

  it('uses valid SITE_DEV_PORT', () => {
    process.env.SITE_DEV_PORT = '7010'
    delete process.env.PORT
    expect(siteDevPort(fallback)).toBe(7010)
  })

  it('falls back on invalid SITE_DEV_PORT values', () => {
    for (const invalid of ['70000', '7003.5', '0', '']) {
      process.env.SITE_DEV_PORT = invalid
      delete process.env.PORT
      expect(siteDevPort(fallback)).toBe(fallback)
    }
  })

  it('prefers SITE_DEV_PORT over PORT', () => {
    process.env.SITE_DEV_PORT = '7011'
    process.env.PORT = '7012'
    expect(siteDevPort(fallback)).toBe(7011)
  })
})
