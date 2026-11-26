# 02: Fold persist and storage into @altafusion/fugue-devtools

Status: ready-for-agent
Type: task
Blocked by: 01

Do not publish and do not change `"private": true`.

1. Keep one persist entry inside `fugue-devtools` (the existing `"./persist"` subpath). It imports nothing from Vue or Nuxt
   unless ticket 01 shows that is impossible; if so, say so in the report.
2. Move into `fugue-devtools` only the storage code persist uses (`createStorage`, the `StorageAPI` type and what they need), with
   its tests (`createStorage.test.ts`). Add `@vueuse/core` as a dependency only if the moved code needs it.
3. Change the `fugue-devtools` composables and plugin from `@altafusion/fugue-devtools-persist` to the relative persist entry, and
   remove that dependency from `fugue-devtools/package.json`.
4. Delete the `fugue-devtools-persist` package. Do not delete `fugue-storage` unless ticket 01 point 4 shows it has no other use;
   in that case list it and ask the owner first.
5. Update every reference ticket 01 found: `alias.ts`, `vitest.config.ts`, `tsconfig.packages.json`,
   `packages-platform/eslint-config/eslint.ts`, `README.md`, `README.packages.md`, `packages-fugue/README.md` and the
   `fugue-devtools` README.
6. One conventional commit per logical change (header at most 100 characters). Commit locally; do not push.

## Answer

(append here, then set `Status: resolved`)
