/**
 * Normalize `/login?redirect=` for post-auth navigation.
 */
export function resolveFugueContentLoginRedirect(
  redirect: unknown,
  fallback = '/'
): string {
  if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//'))
    return redirect

  return fallback
}
