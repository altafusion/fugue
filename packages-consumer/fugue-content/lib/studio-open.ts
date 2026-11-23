/** Dispatched in dev to open Nuxt Studio (header Edit and ⌘. / Ctrl+.). */
export const FUGUE_CONTENT_STUDIO_OPEN_EVENT = 'fugue-content:open-studio'

export function dispatchFugueContentStudioOpen() {
  if (import.meta.client)
    window.dispatchEvent(new CustomEvent(FUGUE_CONTENT_STUDIO_OPEN_EVENT))
}
