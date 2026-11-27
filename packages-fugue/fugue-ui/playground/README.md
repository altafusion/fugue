# Fugue UI Playground

Private Nuxt app on port 7011. Extends `@altafusion/fugue-ui` (no theme, no shell), so each page shows a component working with nothing beyond Nuxt UI and VueUse. The colour-mode button in the header checks light and dark.

## Run

From the repo root:

```bash
pnpm play:ui
```

Open http://localhost:7011.

Add a page under `app/pages` for each component or family, and a link to it in `app/app.vue`. This app is not published: the `fugue-ui` package excludes `playground` from its `files`.

The fugue-ui layer leaves `playground/nuxt.config.ts` out of the type-check of the apps that extend fugue-ui, because `defineNuxtConfig` is not a global in them. A new playground file that relies on a layer those apps do not extend needs the same entry in `packages-fugue/fugue-ui/nuxt.config.ts`.
