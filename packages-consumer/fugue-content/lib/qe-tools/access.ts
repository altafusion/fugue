import { isFugueContentStudioSessionCheck } from '../studio-session'

/**
 * Who sees the privileged dev tools sections (the Studio Drafts): everyone in development, and in production a signed-in
 * Studio editor. `sessionCheck` is the `studio-session-check` cookie as `useCookie` returns it: Nuxt parses the cookie value
 * `true` into the boolean `true`, so it is compared as text, never with `=== 'true'`.
 */
export function canUsePrivilegedDevTools(isDev: boolean, sessionCheck: unknown): boolean {
  return isDev || isFugueContentStudioSessionCheck(sessionCheck)
}
