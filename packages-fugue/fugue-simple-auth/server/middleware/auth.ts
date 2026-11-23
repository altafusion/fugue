import { normalizeAuthGateLoginRedirect } from '#simple-auth/lib/login'
import { shouldGatePath } from '#simple-auth/lib/path-gate'
import { getAccessKey, isAuthRequired } from '../utils/access-key'
import { getSimpleAuthConfig } from '../utils/config'
import { isAuthenticated } from '../utils/session'

export default defineEventHandler((event) => {
  if (!isAuthRequired())
    return

  const config = getSimpleAuthConfig()
  const pathname = getRequestURL(event).pathname

  if (!shouldGatePath(pathname, config))
    return

  if (isAuthenticated(event, getAccessKey()))
    return

  const returnTo = normalizeAuthGateLoginRedirect(
    pathname + (getRequestURL(event).search || '')
  )
  const redirect = encodeURIComponent(returnTo)
  return sendRedirect(event, `${config.loginPath}?redirect=${redirect}`, 302)
})
