# @altafusion/fugue-content

## 0.6.2

### Patch Changes

- @altafusion/shell@0.6.2
  - @altafusion/fugue-simple-auth@0.6.2
  - @altafusion/fugue-theme@0.6.2
  - @altafusion/nuxt-base@0.6.2

## 0.6.1

### Patch Changes

- @altafusion/fugue-simple-auth@0.6.1
  - @altafusion/fugue-theme@0.6.1
  - @altafusion/nuxt-base@0.6.1
  - @altafusion/shell@0.6.1

## 0.6.0

### Minor Changes

- ae2d33b: Make `DevToolsPanel` self-contained: mount `<DevToolsPanel />` once and it owns its open state, shows a draggable dock, and opens the drawer on `?qetools` (the new default `openParams`; `?qetools=off` turns it off). Sections now register through `useDevTools().registerSection()` or `nuxtApp.$fugueDevtools`, each `public` or `privileged`, with a reactive `setAccessResolver`. `@altafusion/fugue-content` registers its Studio drafts as a privileged section when fugue-devtools is installed.

### Patch Changes

- @altafusion/shell@0.6.0
  - @altafusion/fugue-simple-auth@0.6.0
  - @altafusion/fugue-theme@0.6.0
  - @altafusion/nuxt-base@0.6.0

## 0.5.0

### Patch Changes

- @altafusion/fugue-simple-auth@0.5.0
  - @altafusion/fugue-theme@0.5.0
  - @altafusion/nuxt-base@0.5.0
  - @altafusion/shell@0.5.0

## 0.4.0

### Minor Changes

- 34baa90: Remove the page-level Edit button from the `article` and `article-aside` layouts. It repeated Studio's own "Edit this page" button and, being an in-flow row, pushed the page content down for editors. The `stem` prop of `FugueContentLayoutArticle` is gone with it. The footer Edit entry now shows only to visitors without a Studio session (it is the way in to `/login`), and fragment Edit buttons are unchanged.

### Patch Changes

- Updated dependencies [a5133f5]
  - @altafusion/nuxt-base@0.4.0
  - @altafusion/fugue-simple-auth@0.4.0
  - @altafusion/fugue-theme@0.4.0
  - @altafusion/shell@0.4.0

## 0.3.5

### Patch Changes

- 1ec7d4f: Install `nuxt-studio` from the `@altafusion/nuxt-studio` fork (1.8.2 plus the host `@nuxtjs/i18n` locale fix from upstream PR 501 and the media id quoting fix). Studio labels no longer show raw `studio.*` keys on sites that use `@nuxtjs/i18n`, and sites no longer need their own `nuxt-studio@1.8.2` patch: delete `patches/nuxt-studio@1.8.2.patch` and its `patchedDependencies` entry when updating, or pnpm reports an unused patch.
- @altafusion/fugue-simple-auth@0.3.5
  - @altafusion/fugue-theme@0.3.5
  - @altafusion/nuxt-base@0.3.5
  - @altafusion/shell@0.3.5

## 0.3.4

### Patch Changes

- 153c441: Raise the minimum Nuxt tooling versions: `nuxt` and `@nuxt/kit` to `^4.7.0`, `@nuxt/ui` to `^4.13.1` and `@iconify-json/lucide` to `^1.2.158`.
- Updated dependencies [153c441]
  - @altafusion/fugue-simple-auth@0.3.4
  - @altafusion/nuxt-base@0.3.4
  - @altafusion/fugue-theme@0.3.4
  - @altafusion/shell@0.3.4

## 0.3.3

### Patch Changes

- 1cc8b7e: Standalone sites no longer fail on first lint or test run. `fugueContentStudioSection` takes optional `owner` and `repo`
  (defaults unchanged). `@altafusion/eslint-config` now requires its `@antfu/eslint-config` and `eslint` peers instead of
  marking them optional, and `@altafusion/test-kit` depends on `happy-dom` directly.
- @altafusion/fugue-simple-auth@0.3.3
  - @altafusion/fugue-theme@0.3.3
  - @altafusion/nuxt-base@0.3.3
  - @altafusion/shell@0.3.3

## 0.3.2

### Patch Changes

- @altafusion/fugue-simple-auth@0.3.2
  - @altafusion/fugue-theme@0.3.2
  - @altafusion/nuxt-base@0.3.2
  - @altafusion/shell@0.3.2

## 0.3.1

### Patch Changes

- @altafusion/fugue-simple-auth@0.3.1
  - @altafusion/fugue-theme@0.3.1
  - @altafusion/nuxt-base@0.3.1
  - @altafusion/shell@0.3.1

## 0.3.0

### Patch Changes

- Updated dependencies [da3fca4]
- Updated dependencies [da3fca4]
  - @altafusion/nuxt-base@0.3.0
  - @altafusion/fugue-theme@0.3.0
  - @altafusion/fugue-simple-auth@0.3.0
  - @altafusion/shell@0.3.0

## 0.2.0

### Minor Changes

- 7767e60: Rebrand for the public release. In `@altafusion/shell`, `CODERMAR_BRANDS`, `CODERMAR_BRAND_THEME` and `utils/codermarBrandTheme` become `ALTAFUSION_*` and `utils/altafusionBrandTheme`, and the brand cookie key is now `altafusion:brand`. In `@altafusion/msw`, the `codermarMsw*` exports become `altafusionMsw*`. The site settings schema `$id` is now `https://altafusion.com/schemas/site-settings.json`. Package descriptions and docs no longer reference private sites.

### Patch Changes

- Updated dependencies [7767e60]
  - @altafusion/fugue-simple-auth@0.2.0
  - @altafusion/fugue-theme@0.2.0
  - @altafusion/nuxt-base@0.2.0
  - @altafusion/shell@0.2.0

## 0.1.1

### Patch Changes

- Updated dependencies [cd1a639]
  - @altafusion/shell@0.1.1
  - @altafusion/fugue-simple-auth@0.1.1
  - @altafusion/fugue-theme@0.1.1
  - @altafusion/nuxt-base@0.1.1
