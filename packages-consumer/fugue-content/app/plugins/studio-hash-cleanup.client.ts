/** Leftover from a removed Studio rescan experiment — strip before router/hydration when possible. */
const STUDIO_SCAN_HASH = '#_studio_scan'

if (import.meta.client && window.location.hash === STUDIO_SCAN_HASH) {
  window.history.replaceState(
    window.history.state,
    '',
    window.location.pathname + window.location.search
  )
}

export default defineNuxtPlugin(() => {})
