/**
 * Docus site template — branding for login chrome and favicon.
 * Docus supplies the doc theme; override header via AppHeader.vue when needed.
 */
export default defineAppConfig({
  brand: {
    name: 'My documentation',
    favicon: '/favicon.svg'
  },
  /** Hide Docus theme GitHub icons when Studio uses Google OAuth. */
  github: {
    url: ''
  },
  docsNavigation: {
    collapsedSectionSuffixes: []
  },
  ui: {
    contentNavigation: {
      slots: {
        linkTrailing: ''
      }
    }
  }
})
