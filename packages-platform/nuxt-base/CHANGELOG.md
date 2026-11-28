# @altafusion/nuxt-base

## 0.6.1

### Patch Changes

- @altafusion/eslint-config@0.6.1

## 0.6.0

### Patch Changes

- @altafusion/eslint-config@0.6.0

## 0.5.0

### Patch Changes

- @altafusion/eslint-config@0.5.0

## 0.4.0

### Patch Changes

- a5133f5: Allow a linked Fugue checkout in Vite's `server.fs.allow`. With `pnpm link:fugue`, Nuxt Content's `sqlite3.wasm` is served from the checkout's `node_modules`, which Vite blocked (403), so a client-side navigation to a content page failed with "Failed to load content." Installed from npm, nothing changes.
- @altafusion/eslint-config@0.4.0

## 0.3.5

### Patch Changes

- @altafusion/eslint-config@0.3.5

## 0.3.4

### Patch Changes

- 153c441: Raise the minimum Nuxt tooling versions: `nuxt` and `@nuxt/kit` to `^4.7.0`, `@nuxt/ui` to `^4.13.1` and `@iconify-json/lucide` to `^1.2.158`.
- @altafusion/eslint-config@0.3.4

## 0.3.3

### Patch Changes

- Updated dependencies [1cc8b7e]
  - @altafusion/eslint-config@0.3.3

## 0.3.2

### Patch Changes

- Updated dependencies [46f552d]
  - @altafusion/eslint-config@0.3.2

## 0.3.1

### Patch Changes

- Updated dependencies [bc79817]
  - @altafusion/eslint-config@0.3.1

## 0.3.0

### Patch Changes

- da3fca4: Remove dead links to the old documentation site from the package READMEs, and drop a site-specific entry from the `reset-fugue-content-site` helper.
- Updated dependencies [91aea5e]
  - @altafusion/eslint-config@0.3.0

## 0.2.0

### Minor Changes

- 7767e60: Rebrand for the public release. In `@altafusion/shell`, `CODERMAR_BRANDS`, `CODERMAR_BRAND_THEME` and `utils/codermarBrandTheme` become `ALTAFUSION_*` and `utils/altafusionBrandTheme`, and the brand cookie key is now `altafusion:brand`. In `@altafusion/msw`, the `codermarMsw*` exports become `altafusionMsw*`. The site settings schema `$id` is now `https://altafusion.com/schemas/site-settings.json`. Package descriptions and docs no longer reference private sites.

### Patch Changes

- Updated dependencies [7767e60]
  - @altafusion/eslint-config@0.2.0

## 0.1.1

### Patch Changes

- @altafusion/eslint-config@0.1.1
