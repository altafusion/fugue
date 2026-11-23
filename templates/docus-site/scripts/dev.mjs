#!/usr/bin/env node
/**
 * Local dev on localhost with aligned ports and macOS vite-node socket path fix.
 * Nuxt 4.4+ IPC sockets under $TMPDIR can exceed macOS ~104-byte limit → EINVAL.
 *
 * Port: MY_DOCS_DEV_PORT or PORT from .env (default 8002 — see templateDevPorts in dev/ports.ts).
 * Host: localhost (not 127.0.0.1) for Google OAuth redirect + cookie parity.
 */
import { spawn } from 'node:child_process'
import os from 'node:os'
import process from 'node:process'

const port = String(
  Number(process.env.MY_DOCS_DEV_PORT) || Number(process.env.PORT) || 8002
)

const env = {
  ...process.env,
  PORT: port,
  NUXT_PORT: port,
  NITRO_PORT: port
}

if (process.platform === 'darwin') {
  const tmpdir = env.TMPDIR || os.tmpdir()
  const sampleSocket = `${tmpdir}/nuxt-vite-node-XXXXXX/nuxt-vite-node-${process.pid}-${Date.now()}.sock`
  if (sampleSocket.length >= 104)
    env.TMPDIR = '/tmp'
}

const child = spawn(
  'nuxt',
  [
    'dev',
    '--no-open',
    '--host',
    'localhost',
    '--port',
    port,
    '--strictPort'
  ],
  {
    stdio: 'inherit',
    env,
    cwd: process.cwd()
  }
)

child.on('exit', (code, signal) => {
  if (signal)
    process.kill(process.pid, signal)
  process.exit(code ?? 0)
})
