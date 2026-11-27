# Fold the devtools persist and storage code into @altafusion/fugue-devtools

Status: resolved (published as 0.5.0 on 2026-11-27)

## Problem

`@altafusion/fugue-devtools` (the dockable dev drawer) depends on two more private packages, `@altafusion/fugue-devtools-persist`
and `@altafusion/fugue-storage`. All three are `0.1.0` and `private: true`, and none is on npm. Publishing the drawer so other
sites (the Camila site, `camilajalfonso/camilajessica`) can install it would mean publishing three packages. It is not known
whether the split is still needed.

## Terms

"qetools" is the owner's name for `@altafusion/fugue-devtools`: a debugger drawer a site enables with a URL param. The package
default is `?devtools`; a site sets its own through `openParams` (for example `['qetools']`). It is the same package, not a
separate one. `@altafusion/msw` (`packages-platform/msw`) is separate and independent of this work.

## Goal

One package, `@altafusion/fugue-devtools`, that contains the persist helpers and the storage code they use. Its public API and
the persisted state do not change. Nothing is published in this work.

## Preserve

- The `"."` layer export and the `"./persist"` subpath (already present: `persist/index.ts`, `persist/types.ts`).
- Persist exports: `getDevToolsStorage`, `readDevToolsChrome`, `readDevToolsPersisted`, `writeDevToolsChrome`,
  `writeDevToolsPersisted`, `createDefaultDevToolsChrome`, `DEVTOOLS_PANEL_POSITIONS`, `DEVTOOLS_PERSIST_VERSION`,
  `isDevToolsPanelPosition`, `isDevToolsPersistedV1`, `isHorizontalDevToolsDock`, and the types `DevToolsChromeState`,
  `DevToolsPanelPosition`, `DevToolsPersistedV1`, `DevToolsPersistVersion`.
- The persisted shape `{ v, chrome, domain }` and its version.
- Component names stay `DevTools*` under `components/DevTools/` (never flatten `Panel.vue` to the layer root).

## Out of scope

- Publishing, or changing `"private": true`, versions or changesets.
- A Studio adapter, or any change to `@altafusion/fugue-content` or its `window.qeTools` API.
- Deleting `fugue-storage` unless the investigation shows it has no other use, and then only after the owner agrees.

## Constraints

- Ignore `.claude/worktrees/*`; it holds copies of the repo.
- Conventional commits (commitlint: header at most 100 characters), one commit per logical change, local only, no push.
- Never put tokens or credentials in files or messages.
- The sandbox cannot reach localhost: do not claim UI behaviour works from a typecheck alone.

## Acceptance criteria

1. The investigation (ticket 01) is answered with file-path evidence before any code changes.
2. `@altafusion/fugue-devtools` no longer depends on `@altafusion/fugue-devtools-persist`; the persist entry lives inside it and
   imports nothing from Vue or Nuxt, or the report says exactly why that is impossible.
3. The `fugue-devtools-persist` package is gone and no file in the repo (outside `.claude/worktrees/`) still references it:
   `alias.ts`, `vitest.config.ts`, `tsconfig.packages.json`, `packages-platform/eslint-config/eslint.ts`, the READMEs.
4. Only the storage code persist uses has moved, with its tests; `@vueuse/core` is added to `fugue-devtools` only if that code needs it.
5. `pnpm lint`, `pnpm typecheck` and `pnpm test` pass for the touched packages and their consumers.
6. A short browser checklist is provided for the owner (open with the activation param (`?devtools` by default; `?qetools` where the site sets `openParams`), dock to each side, reload to confirm the
   state persists, close).
7. A report lists what was found, moved, deleted or kept, what could not be verified, and what is still needed to publish
   (versions, the private flag, the release process, `minimumReleaseAge` exclusions in consumers).

## Open questions

- Why is `fugue-devtools-persist` its own package? (Ticket 01.)
- Does persist stay framework-free through `fugue-storage`, which depends on `@vueuse/core`?
- Does `fugue-storage` have any other consumer or purpose?

## Tickets

- `issues/01-investigate-persist-package.md`
- `issues/02-fold-persist-and-storage.md`
- `issues/03-verify-and-report.md`
