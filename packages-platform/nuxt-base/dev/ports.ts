/** Canonical local dev HTTP ports — 70xx range so apps can run in parallel. */
import process from 'node:process'

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
 * Vite dev-server opts. The HTTP port stays on `devServer`.
 * Nuxt attaches the HMR websocket to that same server — do not set
 * `hmr.port` or `hmr.clientPort` to a different port.
 */
export function devViteServerOptions() {
  return {
    host: 'localhost',
    strictPort: true,
    hmr: { host: 'localhost' },
  } as const
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
