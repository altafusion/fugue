import type { H3Event } from 'h3'
import process from 'node:process'
import { createSessionToken, verifySessionToken } from '#simple-auth/lib/session'
import { getSimpleAuthConfig } from './config'

export function isAuthenticated(event: H3Event, accessKey: string): boolean {
  const { cookieName, sessionLabel } = getSimpleAuthConfig()
  const token = getCookie(event, cookieName)
  if (!token)
    return false

  return verifySessionToken(token, accessKey, sessionLabel)
}

export function setSessionCookie(event: H3Event, accessKey: string) {
  const { cookieName, sessionLabel } = getSimpleAuthConfig()
  setCookie(event, cookieName, createSessionToken(accessKey, sessionLabel), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/'
  })
}

export function clearSessionCookie(event: H3Event) {
  const { cookieName } = getSimpleAuthConfig()
  deleteCookie(event, cookieName, { path: '/' })
}
