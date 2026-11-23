/**
 * Reset module-scoped footer actions before each SSR request.
 * Prevents dev-server / warm-lambda leaks from rendering editor chrome on the server.
 */
export default defineNuxtPlugin({
  name: 'fugue-content:studio-footer-actions-reset',
  enforce: 'pre',
  setup() {
    setShellFooterRight(null)
  }
})
