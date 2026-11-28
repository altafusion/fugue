import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Build-time only (it imports `node:fs`, so only `nuxt.config.ts` may import it): the `@altafusion/*` packages a site has
 * installed, as `{ '@altafusion/shell': '0.6.3' }`, read from `<rootDir>/node_modules/@altafusion/*\/package.json`.
 */
export function readAltafusionPackages(rootDir: string): Record<string, string> {
  const scopeDir = join(rootDir, 'node_modules', '@altafusion')
  if (!existsSync(scopeDir))
    return {}

  const packages: Record<string, string> = {}
  for (const dir of readdirSync(scopeDir).sort()) {
    const file = join(scopeDir, dir, 'package.json')
    if (!existsSync(file))
      continue
    try {
      const pkg = JSON.parse(readFileSync(file, 'utf8')) as { name?: string, version?: string }
      if (pkg.name && pkg.version)
        packages[pkg.name] = pkg.version
    } catch {
      // A package.json that cannot be read is skipped; the list is a convenience for bug reports.
    }
  }
  return packages
}
