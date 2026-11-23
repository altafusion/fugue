/** Docus app.vue injects `<link rel="icon" href="/favicon.ico">` after nuxt.config head. */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    document.querySelectorAll('link[rel~="icon"][href="/favicon.ico"]').forEach(el => el.remove())

    if (!document.querySelector('link[rel~="icon"][href="/favicon.svg"]')) {
      const link = document.createElement('link')
      link.rel = 'icon'
      link.type = 'image/svg+xml'
      link.href = '/favicon.svg'
      document.head.append(link)
    }
  })
})
