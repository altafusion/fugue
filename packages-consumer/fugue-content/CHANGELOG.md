# @altafusion/fugue-content

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
