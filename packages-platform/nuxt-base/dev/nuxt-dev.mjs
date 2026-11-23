#!/usr/bin/env node
import { spawn } from 'node:child_process'
/**
 * Run `nuxt dev` on the canonical 70xx port with env + CLI aligned.
 * Usage: node @altafusion/nuxt-base/dev/nuxt-dev.mjs [devPortsKey]   (or the `altafusion-nuxt-dev` bin)
 *
 * Keys must match `devPorts` in dev/ports.ts (see ports.test.ts). The key is optional when `SITE_DEV_PORT` or `PORT` is set,
 * which is how a site outside this monorepo picks its port.
 * fugue-content-site apps: optional `SITE_DEV_PORT` or `PORT` in cwd `.env` overrides the default.
 */
import { existsSync, readFileSync } from 'node:fs'
import os from 'node:os'
import { dirname, join } from 'node:path'
import process from 'node:process'

function findNuxtBin(startDir) {
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

/** @type {Record<string, number>} — keep in sync with dev/ports.ts */
const devPorts = {
  developerDocs: 7005,
  pickup: 7006,
}

const key = process.argv[2]
// Sites outside this registry pass their port as the second argument: nuxt-dev.mjs <key> <port>
const defaultPort = devPorts[key] ?? (Number(process.argv[3]) || undefined)

function readDotEnvValue(name) {
  try {
    const line = readFileSync(join(process.cwd(), '.env'), 'utf8')
      .split('\n')
      .find(entry => entry.startsWith(`${name}=`) && !entry.trimStart().startsWith('#'))
    if (!line)
      return undefined
    const raw = line.slice(name.length + 1).trim()
    const quoted = (raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith('\'') && raw.endsWith('\''))
    return quoted
      ? raw.slice(1, -1)
      : raw
  } catch {
    return undefined
  }
}

const port = Number(process.env.SITE_DEV_PORT)
  || Number(process.env.PORT)
  || Number(readDotEnvValue('SITE_DEV_PORT'))
  || Number(readDotEnvValue('PORT'))
  || defaultPort

// A site outside this monorepo has no key in `devPorts`; it must set its own port.
if (!port) {
  console.error(
    `[nuxt-dev] No port for app key "${key ?? ''}". Set SITE_DEV_PORT or PORT (env or .env), or use a key from: ${Object.keys(devPorts).join(', ')}`,
  )
  process.exit(1)
}

const portStr = String(port)
const env = {
  ...process.env,
  PORT: portStr,
  NUXT_PORT: portStr,
  NITRO_PORT: portStr,
}

if (key === 'developerDocs') {
  // Bind after Nuxt config loads, so the default logo page is never served.
  env.NUXT_DEV_EAGER_LISTEN = '0'
}

// Nuxt 4.4+ puts vite-node IPC sockets under $TMPDIR/nuxt-vite-node-*/….sock (macOS max ~104 bytes).
// Default macOS TMPDIR (/var/folders/…) exceeds that → connect/listen EINVAL. Prefer /tmp when needed.
if (process.platform === 'darwin') {
  const tmpdir = env.TMPDIR || os.tmpdir()
  const sampleSocket = `${tmpdir}/nuxt-vite-node-XXXXXX/nuxt-vite-node-${process.pid}-${Date.now()}.sock`
  if (sampleSocket.length >= 104) {
    env.TMPDIR = '/tmp'
  }
}

const nuxtBin = findNuxtBin(process.cwd())
if (!nuxtBin) {
  console.error(`[nuxt-dev] Cannot find node_modules/nuxt/bin/nuxt.mjs from ${process.cwd()}`)
  process.exit(1)
}

const child = spawn(
  process.execPath,
  [
    nuxtBin,
    'dev',
    '--no-open',
    '--host',
    'localhost',
    '--port',
    portStr,
    '--strictPort',
  ],
  {
    stdio: 'inherit',
    env,
    cwd: process.cwd(),
  },
)

child.on('exit', (code, signal) => {
  if (signal)
    process.kill(process.pid, signal)
  process.exit(code ?? 0)
})
