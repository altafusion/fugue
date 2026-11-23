import { mountNuxtStudioClient } from '../app/utils/studio-mount'

const OPEN_RETRY_MS = 250
const OPEN_MAX_ATTEMPTS = 12

/**
 * Mount the Studio panel when an editor session cookie is present.
 * Retries while the gated activation hook finishes on first paint.
 */
export async function openFugueContentStudioEditorPanel(): Promise<boolean> {
  if (!import.meta.client)
    return false

  if (document.querySelector('nuxt-studio'))
    return true

  for (let attempt = 0; attempt < OPEN_MAX_ATTEMPTS; attempt++) {
    const mounted = await mountNuxtStudioClient()
    if (mounted)
      return true

    await new Promise(resolve => setTimeout(resolve, OPEN_RETRY_MS))
  }

  return Boolean(document.querySelector('nuxt-studio'))
}
