#!/usr/bin/env node
/* eslint-disable no-console -- CLI script: stdout is its user-facing output */
import { spawnSync } from 'node:child_process'
/**
 * Reset local build/cache state for a fugue-content-site consumer app or template.
 *
 * Usage: node @altafusion/nuxt-base/dev/reset-fugue-content-site.mjs <key>
 * Keys: fugueContentSite | fugue-content-site
 *
 * Does not touch content/, .env, or git state. Clear browser cookies separately (see output).
 */
import { existsSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..')

/** Keep in sync with dev/ports.ts */
const templateDevPorts = {
  fugueContentSite: 8001,
}

/** @type {Record<string, { dir: string, port: number, authCookies: string[] }>} */
const targets = {
  'fugueContentSite': {
    dir: 'templates/fugue-content-site',
    port: templateDevPorts.fugueContentSite,
    authCookies: ['fugue-content-site-auth', 'site-auth'],
  },
  'fugue-content-site': {
    dir: 'templates/fugue-content-site',
    port: templateDevPorts.fugueContentSite,
    authCookies: ['fugue-content-site-auth', 'site-auth'],
  },
}

const artifactDirs = [
  '.nuxt',
  '.output',
  'dist',
  '.data',
  'node_modules/.cache',
  'node_modules/.vite',
]

const key = process.argv[2]
const target = key ? targets[key] : undefined

if (!target) {
  console.error(
    `[reset-fugue-content-site] Unknown key "${key ?? ''}". Valid: ${Object.keys(targets).filter(k => k !== 'fugue-content-site').join(', ')}, fugue-content-site`,
  )
  process.exit(1)
}

const appDir = join(repoRoot, target.dir)

if (!existsSync(appDir)) {
  console.error(`[reset-fugue-content-site] App directory not found: ${target.dir}`)
  process.exit(1)
}

console.log(`[reset-fugue-content-site] ${target.dir} (localhost:${target.port})`)
console.log('[reset-fugue-content-site] Stop the dev server first (Ctrl+C), then re-run dev when done.\n')

for (const name of artifactDirs) {
  const path = join(appDir, name)
  if (!existsSync(path))
    continue
  rmSync(path, { recursive: true, force: true })
  console.log(`  removed ${name}`)
}

const nuxtPrepareScript = join(dirname(fileURLToPath(import.meta.url)), 'nuxt-prepare.mjs')

console.log('\n[reset-fugue-content-site] Regenerating Nuxt types (nuxt-prepare.mjs)...')
const prepare = spawnSync(process.execPath, [nuxtPrepareScript], {
  cwd: appDir,
  stdio: 'inherit',
  env: process.env,
})

if (prepare.status !== 0)
  process.exit(prepare.status ?? 1)

console.log(`
[reset-fugue-content-site] Done. Preserved: content/, .env, git history.

Browser (localhost) — reset does NOT clear cookies or locale. Hard-refresh after dev restart.
  Studio stays closed until Edit or Cmd+.
  Language stuck? delete cookie: i18n_redirected (default locale is en — set in site.config.ts)
  Auth / Edit stuck? delete cookies:
    Auth: ${target.authCookies.join(', ')} (legacy site-auth if present)

Then: pnpm dev:fugue-content-site
`)
