/**
 * Shell layer defaults — merged into every app that extends `@altafusion/shell`.
 */
export default defineAppConfig({
  ui: {
    /**
     * Nuxt UI default `main` is `min-h-[calc(100vh-header)]`. Stacked with a real
     * header + footer that always forces document overflow (~footer height) on
     * every page. Flex-1 fills the shell column instead.
     */
    main: {
      base: 'flex-1 w-full min-h-0'
    }
  }
})
