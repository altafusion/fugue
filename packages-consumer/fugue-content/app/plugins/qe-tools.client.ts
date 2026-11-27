import type { Component } from 'vue'
import { createQeTools } from '../../lib/qe-tools'
import FugueContentQeToolsDrafts from '../components/FugueContentQeToolsDrafts.vue'

const QE_TOOLS_URL_PARAM = 'qetools'

/** The slice of the fugue-devtools API used here. fugue-content never imports that package; it is only there when a site installs it. */
interface DevToolsRegistrar {
  registerSection: (section: {
    id: string
    label: string
    component: Component
    access?: 'public' | 'privileged'
  }) => () => void
}

function hasQeToolsUrlParam(): boolean {
  return [
    ...new URLSearchParams(window.location.search).keys()
  ]
    .some(key => key.toLowerCase() === QE_TOOLS_URL_PARAM)
}

/**
 * Registers `window.qeTools` for operator troubleshooting (dev + production).
 * When `@altafusion/fugue-devtools` is installed, the drawer is the UI over it: the Studio drafts become a (privileged)
 * section and `?qetools` opens the drawer. Without it, `?qetools` or `?qetools=1` prints the console help on load.
 */
export default defineNuxtPlugin({
  name: 'fugue-content:qe-tools',
  setup(nuxtApp) {
    if (typeof indexedDB === 'undefined')
      return

    window.qeTools = createQeTools()

    // `app:created` runs after every plugin has set up, so the order of the layers does not matter.
    nuxtApp.hook('app:created', () => {
      const devtools = (nuxtApp as unknown as { $fugueDevtools?: DevToolsRegistrar }).$fugueDevtools
      if (devtools) {
        devtools.registerSection({
          id: 'studio-drafts',
          label: 'Studio drafts',
          component: FugueContentQeToolsDrafts,
          access: 'privileged'
        })
        return
      }
      if (hasQeToolsUrlParam())
        window.qeTools?.help()
    })
  }
})
