const STUDIO_SCAN_HASH = '#_studio_scan'

/**
 * Path-only locale switch target — strips fragments so SSR and client hydration agree.
 * Browsers do not send the hash to the server; @nuxtjs/i18n may add it on the client only.
 */
export function localeSwitchPathBase(raw: string): string {
  let path = raw.replace(/#_studio_scan$/, '')
  const hashIndex = path.indexOf('#')
  if (hashIndex !== -1)
    path = path.slice(0, hashIndex)
  return path || '/'
}

/** Re-apply in-page anchor after hydration (hash-nav one-page sites). */
export function localeSwitchPathWithHash(base: string, hash: string | undefined): string {
  if (!hash || hash === STUDIO_SCAN_HASH)
    return base
  return `${base}${hash}`
}
