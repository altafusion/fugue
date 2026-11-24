---
'@altafusion/eslint-config': patch
'@altafusion/test-kit': patch
---

Ship compiled JavaScript and type declarations. The 0.3.x tarballs exposed raw `.ts` entry points, which Node cannot load from `node_modules` (`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`), so `eslint.config.mjs`, Playwright and Vitest configs that import these packages failed outside the workspace. The source stays TypeScript in the repo; `publishConfig` points the packed manifest at `dist/`.
