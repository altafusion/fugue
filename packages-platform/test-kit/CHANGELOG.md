# @altafusion/test-kit

## 0.6.3

No changes in this release.

## 0.6.2

No changes in this release.

## 0.6.1

No changes in this release.

## 0.6.0

No changes in this release.

## 0.5.0

No changes in this release.

## 0.4.0

No changes in this release.

## 0.3.5

No changes in this release.

## 0.3.4

No changes in this release.

## 0.3.3

### Patch Changes

- 1cc8b7e: Standalone sites no longer fail on first lint or test run. `fugueContentStudioSection` takes optional `owner` and `repo`
  (defaults unchanged). `@altafusion/eslint-config` now requires its `@antfu/eslint-config` and `eslint` peers instead of
  marking them optional, and `@altafusion/test-kit` depends on `happy-dom` directly.

## 0.3.2

### Patch Changes

- 46f552d: Ship compiled JavaScript and type declarations. The 0.3.x tarballs exposed raw `.ts` entry points, which Node cannot load from `node_modules` (`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`), so `eslint.config.mjs`, Playwright and Vitest configs that import these packages failed outside the workspace. The source stays TypeScript in the repo; `publishConfig` points the packed manifest at `dist/`.

## 0.3.1

No changes in this release.

## 0.3.0

No changes in this release.

## 0.2.0

### Minor Changes

- 7767e60: Rebrand for the public release. In `@altafusion/shell`, `CODERMAR_BRANDS`, `CODERMAR_BRAND_THEME` and `utils/codermarBrandTheme` become `ALTAFUSION_*` and `utils/altafusionBrandTheme`, and the brand cookie key is now `altafusion:brand`. In `@altafusion/msw`, the `codermarMsw*` exports become `altafusionMsw*`. The site settings schema `$id` is now `https://altafusion.com/schemas/site-settings.json`. Package descriptions and docs no longer reference private sites.

## 0.1.1

No changes in this release.
