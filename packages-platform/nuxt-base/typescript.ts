/**
 * Shared TypeScript configuration for Nuxt apps
 */

export const sharedTypeScriptConfig = {
  typeCheck: false,
  strict: true,
  // Build-time files that sit next to `nuxt.config.ts` (the site config registry, its palette) run in Node and can import
  // `node:*`. Nuxt's node project only lists `nuxt.config.*`, so without this the IDE types them with no Node types.
  nodeTsConfig: {
    include: ['../site.config.ts', '../palette.ts'],
    compilerOptions: {
      types: ['node'],
    },
  },
}

export const sharedTSConfig = {
  compilerOptions: {
    strict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noImplicitReturns: true,
  },
}
