/**
 * Open the Nuxt Studio UI after the official `nuxt-studio` client plugin has initialized
 * `window.useStudioHost`. Do not import `host.dev` here — that bypasses Nuxt transforms and
 * breaks on CJS deps (debug, extend, slugify, …).
 */

import { ensureStudioActivation } from '../../lib/studio-activation-gated.js'

export function isNuxtStudioMounted(): boolean {
  return import.meta.client && !!document.querySelector('nuxt-studio')
}

function isStudioHostReady(): boolean {
  return typeof (window as Window & { useStudioHost?: () => unknown }).useStudioHost === 'function'
}

async function waitForStudioHost(timeoutMs = 8000): Promise<boolean> {
  if (isStudioHostReady())
    return true

  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 50))
    if (isStudioHostReady())
      return true
  }

  return isStudioHostReady()
}

async function ensureStudioHostReady(): Promise<boolean> {
  if (isStudioHostReady())
    return true

  if (!import.meta.client)
    return false

  await ensureStudioActivation()
  return waitForStudioHost()
}

/** Attach `<nuxt-studio>` when the host is ready (nuxt-studio `studio.client` plugin). */
export async function mountNuxtStudioClient(): Promise<boolean> {
  if (!import.meta.client)
    return false

  if (isNuxtStudioMounted())
    return true

  const config = useRuntimeConfig().public.studio
  if (!config?.repository)
    return false

  if (!await ensureStudioHostReady()) {
    console.warn(
      '[fugue-content-site] Nuxt Studio host is not ready. Look for errors from the nuxt-studio plugin above, then reload. In dev press ⌘. / Ctrl+.'
    )
    return false
  }

  if (isNuxtStudioMounted())
    return true

  try {
    await import('nuxt-studio/app')
    document.body.appendChild(document.createElement('nuxt-studio'))
    return isNuxtStudioMounted()
  } catch (error) {
    console.error('[fugue-content-site] Failed to open Nuxt Studio UI:', error)
    return false
  }
}
