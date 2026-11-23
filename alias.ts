/**
 * Central alias registry for the Fugue workspace.
 *
 * Consumed by Vitest and package tsconfigs. Nuxt layers register their own
 * `#<scope>` aliases in `nuxt.config.ts` for layer-local resolution.
 */
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('.', import.meta.url))

function r(p: string): string {
  return resolve(repoRoot, p)
}

// ---------------------------------------------------------------------------
// Internal virtual paths (`#<scope>`) — deep imports within one package/layer
// ---------------------------------------------------------------------------

/** Fugue devtools layer (`packages-fugue/fugue-devtools`). */
export const aliasVirtualDevTools: Record<string, string> = {
  '#devtools': r('packages-fugue/fugue-devtools'),
}

/** MSW handler internals (`packages-platform/msw/src`). */
export const aliasVirtualMsw: Record<string, string> = {
  '#msw': r('packages-platform/msw/src'),
}

/** fugue-workflow virtual paths (`packages-fugue/fugue-workflow`). */
export const aliasVirtualWorkflow: Record<string, string> = {
  '#orchestrator': r('packages-fugue/fugue-workflow/app/orchestrator.ts'),
}

export const aliasVirtual: Record<string, string> = {
  ...aliasVirtualDevTools,
  ...aliasVirtualMsw,
  ...aliasVirtualWorkflow,
}

// ---------------------------------------------------------------------------
// Workspace package entry points — Vitest / IDE; use exports in source
// ---------------------------------------------------------------------------

/** Platform toolchain (`packages-platform/`). */
export const aliasPackagesCore: Record<string, string> = {
  '@altafusion/eslint-config': r('packages-platform/eslint-config/eslint.ts'),
  '@altafusion/msw': r('packages-platform/msw/src/client.ts'),
  '@altafusion/nuxt-base': r('packages-platform/nuxt-base/index.ts'),
  '@altafusion/test-kit': r('packages-platform/test-kit/index.ts'),
}

export const aliasPackagesFugue: Record<string, string> = {
  '@altafusion/fugue-storage': r('packages-fugue/fugue-storage/index.ts'),
  '@altafusion/fugue-devtools': r('packages-fugue/fugue-devtools/nuxt.config.ts'),
}

export const aliasPackages: Record<string, string> = {
  ...aliasPackagesCore,
  ...aliasPackagesFugue,
}

// ---------------------------------------------------------------------------
// Combined (Vitest `resolve.alias`)
// ---------------------------------------------------------------------------

export const alias: Record<string, string> = {
  ...aliasVirtual,
  ...aliasPackages,
}

// ---------------------------------------------------------------------------
// TypeScript `paths` — keep in sync with `tsconfig.packages.json`
// ---------------------------------------------------------------------------

export const tsconfigPathsVirtual: Record<string, string[]> = {
  '#devtools/*': ['packages-fugue/fugue-devtools/*'],
  '#msw/*': ['packages-platform/msw/src/*'],
  '#orchestrator': ['packages-fugue/fugue-workflow/app/orchestrator.ts'],
}

export const tsconfigPathsPackages: Record<string, string[]> = {
  '@altafusion/eslint-config/*': ['packages-platform/eslint-config/*'],
  '@altafusion/nuxt-base/*': ['packages-platform/nuxt-base/*'],
  '@altafusion/test-kit/*': ['packages-platform/test-kit/*'],
  '@altafusion/msw/*': ['packages-platform/msw/src/*'],
  '@altafusion/fugue-storage/*': ['packages-fugue/fugue-storage/*'],
  '@altafusion/fugue-devtools/*': ['packages-fugue/fugue-devtools/*'],
}

/** TS `paths` entries for `tsconfig.packages.json` (wildcard subpaths). */
export const tsconfigPaths: Record<string, string[]> = {
  ...tsconfigPathsVirtual,
  ...tsconfigPathsPackages,
}
