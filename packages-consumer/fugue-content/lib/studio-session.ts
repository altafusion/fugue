export {
  FUGUE_CONTENT_STUDIO_DEV_AUTH_CHECK,
  FUGUE_CONTENT_STUDIO_SESSION_CHECK,
  FUGUE_CONTENT_STUDIO_SESSION_ROUTE
} from './studio-cookies.js'

export const FUGUE_CONTENT_STUDIO_SESSION_COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 30,
  sameSite: 'lax' as const,
  path: '/'
}

export interface FugueContentStudioUser {
  email?: string
  name?: string
  avatar?: string
  picture?: string
}

export interface FugueContentStudioSessionPayload {
  user?: FugueContentStudioUser
  id?: string
}

export const FUGUE_CONTENT_STUDIO_DEV_USER: FugueContentStudioUser = {
  email: 'dev@nuxt.com',
  name: 'Dev'
}

export interface ResolveFugueContentStudioUserOptions {
  devAuthCheck?: string | null
  sessionCheck?: string | null
  isDev?: boolean
}

export function isFugueContentStudioSessionCheck(value: unknown): boolean {
  return String(value) === 'true'
}

export function resolveFugueContentStudioUser(
  session: FugueContentStudioSessionPayload | null | undefined,
  devUser?: FugueContentStudioUser | null,
  options: ResolveFugueContentStudioUserOptions = {}
): FugueContentStudioUser | null {
  const fromSession = session?.user
  if (fromSession?.email)
    return normalizeFugueContentStudioUser(fromSession)

  if (devUser?.email)
    return normalizeFugueContentStudioUser(devUser)

  if (options.isDev && isFugueContentStudioSessionCheck(options.devAuthCheck))
    return normalizeFugueContentStudioUser(FUGUE_CONTENT_STUDIO_DEV_USER)

  return null
}

export function normalizeFugueContentStudioUser(user: FugueContentStudioUser): FugueContentStudioUser {
  const avatar = user.avatar ?? user.picture

  return {
    email: user.email,
    name: user.name,
    ...(avatar
      ? { avatar }
      : {})
  }
}

export interface FugueContentStudioSessionState {
  sessionCheck?: string | null
  devAuthCheck?: string | null
  devUser?: FugueContentStudioUser | null
  isDev?: boolean
}

export function hasFugueContentStudioSession(
  sessionCheck: string | null | undefined,
  _session: FugueContentStudioSessionPayload | null | undefined,
  devUser?: FugueContentStudioUser | null,
  isDev = false,
  devAuthCheck?: string | null
): boolean {
  if (isDev && isFugueContentStudioSessionCheck(devAuthCheck))
    return true

  if (isFugueContentStudioSessionCheck(sessionCheck))
    return true

  return Boolean(isDev && devUser?.email)
}
