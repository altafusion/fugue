import { defineEventHandler, getCookie, getQuery, getRequestURL, sendRedirect } from 'h3'

/**
 * Nuxt Studio's /_studio admin route redirects to OAuth without setting `studio-redirect`
 * when only one provider is configured. After Google auth, users land on `/` with no editor.
 *
 * @see https://github.com/nuxt-content/nuxt-studio — admin.js + google.get.js
 */
export default defineEventHandler((event) => {
  const studioRoute = useRuntimeConfig(event).public.studio?.route ?? '/_studio'
  const { pathname } = getRequestURL(event)

  if (pathname !== studioRoute)
    return

  const query = getQuery(event)
  const postAuthPath = typeof query.redirect === 'string' && query.redirect.startsWith('/')
    ? query.redirect
    : '/'

  // Local `nuxt dev`: Studio opens via ⌘. / Ctrl+. — /_studio redirects home in dev.
  if (import.meta.dev)
    return sendRedirect(event, postAuthPath, 302)

  // Production: /_studio is the Google OAuth entry (/login redirects here).
  // Peek-gated sites redirect unauthenticated users to /login first.
  if (getCookie(event, 'studio-session-check') === 'true')
    return sendRedirect(event, postAuthPath, 302)

  if (query.redirect)
    return

  const target = `${studioRoute}?redirect=${encodeURIComponent('/')}`

  return sendRedirect(event, target, 302)
})
