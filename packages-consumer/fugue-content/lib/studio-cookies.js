/** Shared Studio editor cookie names — imported by TS and `studio-activation-gated.js`. */
export const FUGUE_CONTENT_STUDIO_SESSION_ROUTE = '/__nuxt_studio/auth/session'
export const FUGUE_CONTENT_STUDIO_SESSION_CHECK = 'studio-session-check'
/** Dev-only editor session — never sent to `/__nuxt_studio/auth/session` (that route clears `studio-session-check`). */
export const FUGUE_CONTENT_STUDIO_DEV_AUTH_CHECK = 'fugue-content-studio-dev-auth'

export const FUGUE_CONTENT_STUDIO_COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 30,
  sameSite: 'lax',
  path: '/'
}
