/** Apply site-wide SEO defaults from Content settings (and app.config fallbacks). */
export default defineNuxtPlugin(() => {
  useFugueContentSiteSeo()
})
