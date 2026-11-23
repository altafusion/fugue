# @altafusion/fugue-theme

## 0.3.0

### Minor Changes

- da3fca4: Rename the light/dark state key from `sse:theme` to `fugue:theme`, and drop the one-time localStorage migration from legacy workflow and recipe keys in `@altafusion/fugue-workflow`. Code that reads `useState('sse:theme')` directly must use the new key.

### Patch Changes

- Updated dependencies [da3fca4]
  - @altafusion/nuxt-base@0.3.0
  - @altafusion/fugue-nuxt-ui@0.3.0

## 0.2.0

### Minor Changes

- 7767e60: Rebrand for the public release. In `@altafusion/shell`, `CODERMAR_BRANDS`, `CODERMAR_BRAND_THEME` and `utils/codermarBrandTheme` become `ALTAFUSION_*` and `utils/altafusionBrandTheme`, and the brand cookie key is now `altafusion:brand`. In `@altafusion/msw`, the `codermarMsw*` exports become `altafusionMsw*`. The site settings schema `$id` is now `https://altafusion.com/schemas/site-settings.json`. Package descriptions and docs no longer reference private sites.

### Patch Changes

- Updated dependencies [7767e60]
  - @altafusion/fugue-nuxt-ui@0.2.0
  - @altafusion/nuxt-base@0.2.0

## 0.1.1

### Patch Changes

- @altafusion/fugue-nuxt-ui@0.1.1
  - @altafusion/nuxt-base@0.1.1
