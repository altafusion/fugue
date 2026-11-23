import type { FugueContentSiteAuthConfig } from '../types/site'

/** Routes that bypass fugue-simple-auth in full-site peek mode (OAuth callbacks must stay reachable). */
export const studioPublicPrefixes = ['/_studio', '/__nuxt_studio/'] as const

/** Studio + OAuth paths gated when auth `mode` is `routes` (public brochure, editors only). */
export const fugueContentStudioProtectedRoutes = [
  '/_studio',
  '/_studio/**',
  '/__nuxt_studio/**'
] as const

function envPrefixSlug(envPrefix: string): string {
  return envPrefix.toLowerCase().replace(/_/g, '-')
}

/** Build `runtimeConfig.public.fugueSimpleAuth` for defineFugueContentSite. */
export function buildFugueSimpleAuth(
  config: FugueContentSiteAuthConfig,
  options?: { includeStudioBypass?: boolean }
) {
  const slug = envPrefixSlug(config.envPrefix)
  const includeStudioBypass = options?.includeStudioBypass ?? false

  const mode = config.mode ?? 'routes'

  return {
    envPrefix: config.envPrefix,
    mode,
    cookieName: config.cookieName ?? `${slug}-auth`,
    sessionLabel: config.sessionLabel ?? `${slug}-authenticated`,
    loginDescription:
      config.loginDescription ?? 'Enter the access key to open the content editor.',
    publicPrefixes: [
      '/_nuxt/',
      '/__nuxt/',
      ...(includeStudioBypass
        ? studioPublicPrefixes
        : []),
      ...(config.publicPrefixes ?? [])
    ],
    protectedRoutes: config.protectedRoutes ?? []
  }
}
