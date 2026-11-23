import { createQeTools } from '../../lib/qe-tools'

const QE_TOOLS_URL_PARAM = 'qetools'

function hasQeToolsUrlParam(): boolean {
  return [
    ...new URLSearchParams(window.location.search).keys()
  ]
    .some(key => key.toLowerCase() === QE_TOOLS_URL_PARAM)
}

/**
 * Registers `window.qeTools` for operator troubleshooting (dev + production).
 * Console-only — no on-page panel. Use DevTools → Console: `qeTools.help()`.
 * Optional: `?qetools` or `?qetools=1` prints help when the page loads (open Console first).
 */
export default defineNuxtPlugin({
  name: 'fugue-content:qe-tools',
  setup() {
    if (typeof indexedDB === 'undefined')
      return

    window.qeTools = createQeTools()

    if (hasQeToolsUrlParam())
      window.qeTools.help()
  }
})
