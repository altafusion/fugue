import type { FugueSimpleAuthConfig } from '../types/config'

function normalizePrefix(prefix: string): string {
  return prefix.endsWith('/')
    ? prefix
    : `${prefix}/`
}

function matchesProtectedRoute(pathname: string, pattern: string): boolean {
  if (pattern.endsWith('/**')) {
    const base = pattern.slice(0, -3)
    return pathname === base || pathname.startsWith(`${base}/`)
  }

  return pathname === pattern
}

function isAssetOrAuthPath(pathname: string, config: FugueSimpleAuthConfig): boolean {
  if (config.publicExact.includes(pathname))
    return true

  if (config.publicPaths.includes(pathname))
    return true

  if (pathname === config.loginPath)
    return true

  const apiPrefix = normalizePrefix(config.apiPrefix)
  if (pathname.startsWith(apiPrefix) || pathname === config.apiPrefix)
    return true

  return config.publicPrefixes.some(prefix => pathname.startsWith(prefix))
}

/** Returns true when the path is reachable without authentication. */
export function isPathPublic(pathname: string, config: FugueSimpleAuthConfig): boolean {
  if (isAssetOrAuthPath(pathname, config))
    return true

  if (config.mode === 'full')
    return false

  return !config.protectedRoutes.some(pattern => matchesProtectedRoute(pathname, pattern))
}

export function shouldGatePath(pathname: string, config: FugueSimpleAuthConfig): boolean {
  return !isPathPublic(pathname, config)
}
