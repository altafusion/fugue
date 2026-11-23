import { sendRedirect } from 'h3'

/**
 * Docus hardcodes `/favicon.ico` in app.vue. Apps ship branding at `/favicon.svg`
 * (static CDN). Redirect avoids reading `public/` from `process.cwd()`, which fails
 * on Netlify SSR where cwd is not the app package root.
 */
export default defineEventHandler((event) => {
  return sendRedirect(event, '/favicon.svg', 302)
})
