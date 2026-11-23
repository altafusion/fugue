#!/usr/bin/env node
/**
 * Compatibility wrapper — prefer `nuxt-cli.mjs prepare` in new scripts.
 * @see ./nuxt-cli.mjs
 */
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const cli = join(dirname(fileURLToPath(import.meta.url)), 'nuxt-cli.mjs')
const result = spawnSync(
  process.execPath,
  [
    cli,
    'prepare',
    ...process.argv.slice(2),
  ],
  {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: process.env,
  },
)

if (result.error) {
  console.error(`[nuxt-prepare] ${result.error.message}`)
  process.exit(1)
}

process.exit(result.status ?? 1)
