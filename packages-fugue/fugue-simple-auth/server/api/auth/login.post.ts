import { keysMatch } from '#simple-auth/lib/session'
import { getAccessKey, isAuthRequired } from '../../utils/access-key'
import { setSessionCookie } from '../../utils/session'

export default defineEventHandler(async (event) => {
  if (!isAuthRequired())
    return { authenticated: true }

  const body = await readBody<{ key?: string }>(event)
  const providedKey = String(body?.key ?? '')

  if (!keysMatch(providedKey, getAccessKey())) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid access key'
    })
  }

  setSessionCookie(event, getAccessKey())

  return { authenticated: true }
})
