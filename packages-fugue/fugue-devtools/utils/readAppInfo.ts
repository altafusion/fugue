import type { AppInfo } from './appInfo'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

/** Asks git for the current commit; `undefined` when there is no git or no repository (a build from a tarball). */
function gitCommit(rootDir: string): string | undefined {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim() || undefined
  } catch {
    return undefined
  }
}

/**
 * Build-time only (it imports `node:fs`, so only `nuxt.config.ts` may import it): the site's own name and version from its
 * `package.json`, plus the commit it was built from. The version alone barely changes between deploys; the commit does.
 */
export function readAppInfo(
  rootDir: string,
  env: Record<string, string | undefined> = process.env,
  commitFromGit: (dir: string) => string | undefined = gitCommit,
): AppInfo {
  const file = join(rootDir, 'package.json')
  let name: string | undefined
  let version: string | undefined
  if (existsSync(file)) {
    try {
      const pkg = JSON.parse(readFileSync(file, 'utf8')) as { name?: string, version?: string }
      name = pkg.name
      version = pkg.version
    } catch {
      // An unreadable package.json leaves the name and version out; the commit can still show.
    }
  }
  return { name, version, commit: env.COMMIT_REF || env.GITHUB_SHA || commitFromGit(rootDir) }
}
