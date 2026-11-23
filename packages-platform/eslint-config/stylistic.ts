/**
 * Stylistic defaults shared by `@altafusion/nuxt-base` (via `@nuxt/eslint`) and the antfu factories in `./eslint.ts`.
 *
 * Plain data on purpose: no `eslint` or `@antfu/eslint-config` import, so a Nuxt site can build without the lint
 * toolchain installed. Import it as `@altafusion/eslint-config/stylistic`.
 */

/** Stylistic defaults shared with `@nuxt/eslint` (`sharedModuleConfig.eslint.config.stylistic`). */
export const sharedStylisticDefaults = {
  commaDangle: 'never' as const,
  braceStyle: '1tbs' as const,
  indent: 2,
  quotes: 'single' as const,
  semi: false
}
