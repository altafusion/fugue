#!/usr/bin/env node
/**
 * Run the workspace-root `nuxt` binary with the given args.
 *
 * With `nodeLinker: hoisted`, package-local `node_modules/.bin/nuxt` shims can
 * point at `<pkg>/node_modules/nuxt/...` which does not exist (Netlify
 * `pnpm run build` → MODULE_NOT_FOUND). Walking up finds root
 * `node_modules/nuxt/bin/nuxt.mjs`.
 *
 * Usage (from any workspace package two levels below root):
 *   "build": "node ../../packages-platform/nuxt-base/dev/nuxt-cli.mjs build"
 *   "postinstall": "node ../../packages-platform/nuxt-base/dev/nuxt-cli.mjs prepare"
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'

export function findNuxtBin(startDir = process.cwd()) {
  let dir = startDir
  while (true) {
    const candidate = join(dir, 'node_modules', 'nuxt', 'bin', 'nuxt.mjs')
    if (existsSync(candidate))
      return candidate
    const parent = dirname(dir)
    if (parent === dir)
      return null
    dir = parent
  }
}

const args = process.argv.slice(2)
if (!args.length) {
  console.error('[nuxt-cli] Usage: nuxt-cli.mjs <command> [...args]')
  process.exit(1)
}

const bin = findNuxtBin(process.cwd())
if (!bin) {
  console.error(
    `[nuxt-cli] Cannot find node_modules/nuxt/bin/nuxt.mjs from ${process.cwd()}`,
  )
  process.exit(1)
}

const result = spawnSync(process.execPath, [bin, ...args], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: process.env,
})

if (result.error) {
  console.error(`[nuxt-cli] ${result.error.message}`)
  process.exit(1)
}

process.exit(result.status ?? 1)
