import type { Nuxt } from 'nuxt/schema'
import { scheduleOpenDevBrowserOnce } from './open-browser'

const installedHookKey = Symbol.for('altafusion.reuseDevBrowserOnListen')

/**
 * Prefer configured devServer.url — the listen hook can fire before the final port is reflected in listener.url.
 */
export function resolveDevOpenUrl(nuxt: Nuxt, listener: { url: string }): string {
  const fromConfig = nuxt.options.devServer?.url
  if (typeof fromConfig === 'string' && fromConfig.length > 0)
    return fromConfig
  return listener.url
}

/** Reuse the active Chromium tab (Vite-style) instead of Nuxt `--open` → listhen → macOS `open`. */
export function reuseDevBrowserOnListen(_options: unknown, nuxt: Nuxt) {
  if (!nuxt.options.dev)
    return

  const options = nuxt.options as unknown as Record<PropertyKey, unknown>
  if (options[installedHookKey])
    return
  options[installedHookKey] = true

  nuxt.hook('listen', (_server, listener: { url: string }) => {
    scheduleOpenDevBrowserOnce(resolveDevOpenUrl(nuxt, listener))
  })
}
