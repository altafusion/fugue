# @altafusion/fugue-content

## 0.6.4

### Patch Changes

- fbc4be2: Fix the Studio Drafts section never showing to a signed-in editor in production. The access rule compared the `studio-session-check` cookie to the string `'true'`, but `useCookie` parses that value into the boolean `true`, so it was always false. The rule is now `canUsePrivilegedDevTools`, which compares as text like the rest of `fugue-content`, with tests for both forms.
- @altafusion/fugue-simple-auth@0.6.4
  - @altafusion/fugue-theme@0.6.4
  - @altafusion/nuxt-base@0.6.4
  - @altafusion/shell@0.6.4

## 0.6.3

### Patch Changes

- 431c0d0: Add buttons to the Studio drafts section of the dev tools drawer, and show it to signed-in editors in production.
  
  - **Delete Matching** removes every draft whose key contains some text (`qeTools.studioDrafts.deleteMatching`), **Clear All Drafts** removes them all after a second click to confirm (`clearAll`), each row shows its status, and a **Reload Page To Apply** button appears after a delete (Studio keeps a merged copy in memory).
  - The section is privileged, and without an access resolver it only showed in development. `fugue-content` now sets one: development, or a signed-in Studio editor (the `studio-session-check` cookie). A site that wants a different rule calls `setAccessResolver` after it. It is a UI convenience, not a security boundary: the section only touches the browser's own drafts.
  - The section is now called **Studio Drafts**, comes first so it opens by default, and sits in a thin bordered card (`max-w-xl`) with Refresh and Clear All Drafts at the top, Delete Matching under them, then the list.
  - The drawer's section switcher is a Nuxt UI `UTabs` (pill, no content) instead of a row of buttons, and a section no longer repeats its title under the tabs; with a single section there are no tabs, so the title still shows.
- @altafusion/fugue-simple-auth@0.6.3
  - @altafusion/fugue-theme@0.6.3
  - @altafusion/nuxt-base@0.6.3
  - @altafusion/shell@0.6.3

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
