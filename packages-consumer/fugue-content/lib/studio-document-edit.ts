import { isNuxtStudioMounted } from '../app/utils/studio-mount'
import { openFugueContentStudioEditorPanel } from './studio-auto-open'

async function waitForStudioHostMounted(timeoutMs = 15_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    if (typeof window.useStudioHost !== 'function') {
      await new Promise(resolve => setTimeout(resolve, 50))
      continue
    }

    const host = window.useStudioHost()
    if (host.on?.mounted) {
      try {
        host.on.mounted(() => {})
        return true
      } catch {
        return false
      }
    }

    if (isNuxtStudioMounted())
      return true

    await new Promise(resolve => setTimeout(resolve, 50))
  }

  return false
}

declare module '#app' {
  interface RuntimeNuxtHooks {
    'studio:document:edit': (fsPath: string) => void | Promise<void>
  }
}

/**
 * Mount Studio (if needed) and open a content file by repository fsPath.
 * Returns false when the editor could not be opened — logs a console warning.
 */
export async function requestFugueContentStudioDocumentEdit(fsPath: string): Promise<boolean> {
  if (!import.meta.client)
    return false

  const mounted = await openFugueContentStudioEditorPanel()
  if (!mounted) {
    console.warn(
      '[fugue-content-site] Could not mount Nuxt Studio. Open Edit content from the header menu, then try again.'
    )
    return false
  }

  if (!await waitForStudioHostMounted()) {
    console.warn('[fugue-content-site] Studio editor did not become ready in time.')
    return false
  }

  await useNuxtApp().hooks.callHook('studio:document:edit', fsPath)
  return true
}
