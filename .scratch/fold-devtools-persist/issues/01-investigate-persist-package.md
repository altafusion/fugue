# 01: Investigate why fugue-devtools-persist is its own package

Status: resolved
Type: research

Report before changing anything. Answer each point with file-path evidence. Ignore `.claude/worktrees/*`.

1. Who depends on `@altafusion/fugue-devtools-persist` and `@altafusion/fugue-storage` in this repo? Check `package.json` files,
   imports, `alias.ts`, `vitest.config.ts`, `tsconfig.packages.json`, `packages-platform/eslint-config/eslint.ts` and the READMEs.
   Is `fugue-devtools` the only consumer?
2. The persist package says it has no Nuxt or Vue peers, but `fugue-storage` depends on `@vueuse/core`. What do `createStorage`
   and `useNamespacedStorage` import? Does persist stay framework-free through storage?
3. Does `fugue-storage` have any other consumer or purpose, or is it only there for persist?
4. Verdict: can persist and storage be folded into `fugue-devtools` without losing anything real? What would break (consumers,
   subpath exports)?

## Decision rule

If point 3 shows `fugue-storage` has other consumers, stop after reporting and ask the owner. Otherwise ticket 02 is unblocked.

## Answer

Investigated 2026-11-26.

1. **Consumers.** `fugue-devtools` is the only consumer of `fugue-devtools-persist`
   (`packages-fugue/fugue-devtools/package.json:23`; imports in `composables/useDevTools.ts`, `composables/devtoolsTypes.ts`,
   `components/DevTools/Nav.vue`, `components/DevTools/Panel.vue`). `persist/index.ts` and `persist/types.ts` are `@deprecated`
   re-exports of the package. `fugue-storage` is imported only by `fugue-devtools-persist/src/storage.ts`.
   Other references to clean up when folding: `alias.ts:54,87`, `tsconfig.packages.json:20`, `vitest.config.ts:93`,
   `packages-platform/eslint-config/eslint.ts:63`, `README.md:18,21`, `packages-fugue/README.md:12,14`,
   `packages-fugue/fugue-devtools/README.md:43`, `pnpm-lock.yaml`. `alias.ts` and `vitest.config.ts` have no entry for
   `fugue-devtools-persist` itself (only storage).
2. **Framework-free?** No. `fugue-storage/createStorage.ts:3` imports the runtime value `StorageSerializers` from `@vueuse/core`;
   `useNamespacedStorage.ts` imports `useStorage` from `@vueuse/core` and types from `vue`. Persist imports only `createStorage`
   and types, but `createStorage` pulls in `@vueuse/core` at runtime. "No Nuxt/Vue peers" is true of persist's own
   `package.json` only.
3. **Other storage use.** None in this repo; persist is the only consumer.
4. **Verdict.** Folding persist and the storage code it uses into `fugue-devtools` loses nothing in this repo: one consumer,
   and the `"./persist"` subpath keeps the public API. Ticket 02 is unblocked.

Note: `@altafusion/msw` (`packages-platform/msw`) does not depend on persist or storage, so folding does not affect it.
