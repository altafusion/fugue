# 02: Fold persist and storage into @altafusion/fugue-devtools

Status: resolved
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

Done 2026-11-26, local commits only (not pushed): `3bbe617`, `b8c64a8`, `ba0f64c`.

- **Persist moved** into `packages-fugue/fugue-devtools/persist/` (`index.ts`, `types.ts`, `storage.ts`). Same exports, same
  persisted shape `{ v, chrome, domain }`, and the `"./persist"` subpath is unchanged. The composables and components now import
  `#devtools/persist`.
- **Storage code copied** into `persist/` (`createStorage.ts`, `storageTypes.ts`, `createStorage.test.ts`, 5 tests passing).
  `createStorage` used `StorageSerializers.object` from `@vueuse/core`, which is `JSON.parse` / `JSON.stringify`; it is inlined, so
  persist now imports nothing from Vue, Nuxt or `@vueuse/core` and `@vueuse/core` was **not** added to `fugue-devtools`.
- **Deleted** `packages-fugue/fugue-devtools-persist/`; removed its dependency from `fugue-devtools/package.json`; updated the
  lockfile, `README.md`, `packages-fugue/README.md` and the `fugue-devtools` README. `alias.ts`, `vitest.config.ts`,
  `tsconfig.packages.json` and the eslint config never referenced persist, so they needed no change.
- **`fugue-storage` kept.** Nothing in the repo imports it any more. Owner decision 2026-11-26: keep it for now; revisit later (deleting
  it would also remove its alias, vitest project, tsconfig path, eslint pattern and README entries).
- **Checks:** `pnpm -r lint`, `pnpm -r typecheck` and `vitest run` (59 files, 613 tests) pass. Not verified: UI behaviour (ticket 03).

