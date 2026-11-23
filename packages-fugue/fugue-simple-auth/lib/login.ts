export interface SimpleAuthSession {
  authenticated: boolean
  required: boolean
}

/**
 * After the access-key gate, send editors to a public page — not `/_studio`.
 * Studio OAuth is started from the header **Edit** control.
 */
export function normalizeAuthGateLoginRedirect(targetPath: string, fallback = '/'): string {
  if (!targetPath.startsWith('/'))
    return fallback

  const queryIndex = targetPath.indexOf('?')
  const pathname = queryIndex === -1
    ? targetPath
    : targetPath.slice(0, queryIndex)
  const search = queryIndex === -1
    ? ''
    : targetPath.slice(queryIndex + 1)

  if (pathname.startsWith('/__nuxt_studio/'))
    return fallback

  if (pathname !== '/_studio' && !pathname.startsWith('/_studio/'))
    return targetPath

  if (search) {
    const inner = new URLSearchParams(search).get('redirect')
    if (inner?.startsWith('/'))
      return inner
  }

  return fallback
}

export function resolveSimpleAuthRedirect(
  redirectQuery: unknown,
  fallback = '/'
): string {
  if (typeof redirectQuery === 'string' && redirectQuery.startsWith('/'))
    return normalizeAuthGateLoginRedirect(redirectQuery, fallback)

  return fallback
}

export function shouldShowSimpleAuthLogin(session: SimpleAuthSession | null | undefined): boolean {
  return Boolean(session?.required && !session?.authenticated)
}

export function shouldShowSimpleAuthSignOut(session: SimpleAuthSession | null | undefined): boolean {
  return Boolean(session?.required && session?.authenticated)
}

/**
 * POST /api/auth/logout to clear orphan peek-gate cookies when the session API
 * reports they are not active (invalid token, gate off at runtime, or anonymous).
 */
export function shouldClearStaleAuthSession(session: SimpleAuthSession | null | undefined): boolean {
  if (!session)
    return false

  if (!session.required)
    return true

  return !session.authenticated
}
