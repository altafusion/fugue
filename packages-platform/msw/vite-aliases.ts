/**
 * Vite alias entries for live-editing `@altafusion/msw` source during dev.
 * Import in app `nuxt.config.ts` or Vitest config when handler hot-reload is needed.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** Same shape as Vite `Alias` (avoid a `vite` dependency in this package). */
export interface AltafusionMswViteAlias {
  find: string | RegExp
  replacement: string
}

const packageRoot = fileURLToPath(new URL('.', import.meta.url))
const src = path.join(packageRoot, 'src')

export const altafusionMswViteAliases: AltafusionMswViteAlias[] = [
  { find: '#msw', replacement: src },
  {
    find: '@altafusion/msw/handlers/shared',
    replacement: path.join(src, 'handlers/shared/index.ts'),
  },
  {
    find: '@altafusion/msw/utils/mockDb',
    replacement: path.join(src, 'utils/mockDb.ts'),
  },
  {
    find: '@altafusion/msw/browser',
    replacement: path.join(src, 'browser.ts'),
  },
  {
    find: '@altafusion/msw/node',
    replacement: path.join(src, 'node.ts'),
  },
  {
    find: '@altafusion/msw',
    replacement: path.join(src, 'client.ts'),
  },
]

export const altafusionMswPackageRoot = packageRoot

interface FsAllowConfig {
  strict?: boolean
  allow?: string[]
}

/**
 * Merge `server.fs.allow` for live-editing the package without dropping the app root.
 */
export function mergeAltafusionMswServerFs(
  appRoot: string,
  existing?: FsAllowConfig,
): FsAllowConfig {
  const prior = Array.isArray(existing?.allow)
    ? existing.allow
    : []
  const allow = [
    ...new Set([appRoot, altafusionMswPackageRoot, ...prior]),
  ]
  return {
    ...existing,
    allow,
  }
}
