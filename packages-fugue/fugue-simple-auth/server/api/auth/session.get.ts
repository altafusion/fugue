import { getAccessKey, isAuthRequired } from '../../utils/access-key'
import { isAuthenticated } from '../../utils/session'

export default defineEventHandler((event) => {
  if (!isAuthRequired())
    return { authenticated: true, required: false }

  return {
    authenticated: isAuthenticated(event, getAccessKey()),
    required: true
  }
})
