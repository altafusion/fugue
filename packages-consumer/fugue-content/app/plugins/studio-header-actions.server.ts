/**
 * Reset module-scoped header actions before each SSR request.
 * Prevents dev-server / warm-lambda leaks from rendering editor chrome on the server.
 */
export default defineNuxtPlugin({
  name: 'fugue-content:studio-header-actions-reset',
  enforce: 'pre',
  setup() {
    setShellHeaderActions(null)
    setShellHeaderRight(null)
    setShellFooterRight(null)
  }
})
