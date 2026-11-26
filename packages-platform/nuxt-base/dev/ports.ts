/** Canonical local dev HTTP ports — 70xx range so apps can run in parallel. */
import { existsSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

// Port 7003 is reserved for the first site copied from templates/fugue-content-site (not assigned here).
export const devPorts = {
  developerDocs: 7005,
  pickup: 7006,
  themePlayground: 7010,
} as const

/** Workspace starter templates — 80xx range, separate from {@link devPorts} apps. */
export const templateDevPorts = {
  fugueContentSite: 8001,
  docusSite: 8002,
} as const

export function devServerOptions(port: number) {
  return {
    port,
    host: 'localhost',
    strictPort: true,
    url: `http://localhost:${port}`,
  } as const
}

/**
 * Root of the Fugue checkout this package runs from when an app links it (`pnpm link:fugue`), or `null` when the package is
 * installed from npm. A linked checkout sits outside the app's root, so Vite refuses to serve files in its `node_modules`
 * (for example Nuxt Content's `sqlite3.wasm`, which the browser needs to query content on a client-side navigation).
 * Installed from npm, this package lives under the app's own `node_modules`, which Vite already allows.
 */
export function linkedCheckoutRoot(dir: string = dirname(fileURLToPath(import.meta.url))): string | null {
  const root = resolve(dir, '../../..')
  if (root.split(sep).includes('node_modules'))
    return null
  return existsSync(join(root, 'pnpm-workspace.yaml'))
    ? root
    : null
}

/**
 * Vite dev-server opts. The HTTP port stays on `devServer`.
 * Nuxt attaches the HMR websocket to that same server — do not set
 * `hmr.port` or `hmr.clientPort` to a different port.
 * When the package is linked from a Fugue checkout, that checkout is added to `fs.allow` (see {@link linkedCheckoutRoot}).
 */
export function devViteServerOptions() {
  const linkedRoot = linkedCheckoutRoot()
  return {
    host: 'localhost',
    strictPort: true,
    hmr: { host: 'localhost' },
    ...(linkedRoot
      ? {
          fs: {
            allow: [linkedRoot],
          },
        }
      : {}),
  }
}

/**
 * Vite server opts for workspace templates — @see {@link devViteServerOptions}.
 */
export function templateViteServerOptions() {
  return devViteServerOptions()
}

/**
 * Drop a separate HMR port so the client uses the dev server Nuxt already
 * attached the websocket to. Leaves `hmr: false` alone.
 */
export function pinDevServerHmr(server: { hmr?: Record<string, unknown> | boolean }) {
  if (server.hmr === false)
    return
  const prev = typeof server.hmr === 'object' && server.hmr !== null
    ? server.hmr
    : {}
  const { port: _port, clientPort: _clientPort, ...rest } = prev
  server.hmr = {
    ...rest,
    host: 'localhost',
  }
}

/** Env vars so Nuxt/Vite resolve the same port as {@link devServerOptions}. */
export function devPortEnv(port: number): Record<string, string> {
  const value = String(port)
  return {
    PORT: value,
    NUXT_PORT: value,
    NITRO_PORT: value,
  }
}

/**
 * Local HTTP port for Fugue Content consumer apps and templates.
 * Each app `.env` sets `SITE_DEV_PORT` (or `PORT`); value differs per app, name stays generic.
 */
function parseDevPort(raw: string | undefined): number | undefined {
  if (raw === undefined || raw.trim() === '')
    return undefined
  const trimmed = raw.trim()
  if (!/^\d+$/.test(trimmed))
    return undefined
  const port = Number(trimmed)
  if (port < 1 || port > 65535)
    return undefined
  return port
}

export function siteDevPort(fallback: number): number {
  const fromSite = parseDevPort(process.env.SITE_DEV_PORT)
  if (fromSite !== undefined)
    return fromSite
  const fromPort = parseDevPort(process.env.PORT)
  if (fromPort !== undefined)
    return fromPort
  return fallback
}
