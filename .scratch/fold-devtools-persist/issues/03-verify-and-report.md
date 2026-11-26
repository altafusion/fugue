# 03: Verify and report

Status: resolved (browser checklist pending the owner)
Type: task
Blocked by: 02

1. Run `pnpm lint`, `pnpm typecheck` and `pnpm test` (at least for the touched packages and anything that consumed them).
2. Keep or add tests for the persist helpers and for `useDevTools`: opening by query param, persisting and restoring, dock position.
3. Do not claim the drawer works from a typecheck alone. Write a browser checklist for the owner to run in an app that extends
   the layer: open with the activation param (`?devtools` by default; `?qetools` where the site sets `openParams`), dock to each side, reload to confirm the state persists, close.
4. Report: the ticket 01 findings (with file paths), what was moved, deleted or kept, every reference updated, test results,
   anything that could not be verified, and what is still needed before publishing (versions, the private flag, the release
   process, `minimumReleaseAge` exclusions in consumers such as `camilajalfonso/camilajessica`).

## Answer

Done 2026-11-26. Everything below is local to this repo.

## Results

- `pnpm -r lint`, `pnpm -r typecheck` and `vitest run` all pass: 62 test files, 637 tests (was 59 / 613).
- New tests, all in `packages-fugue/fugue-devtools/`:
  - `persist/storage.test.ts`: guards, defaults, the `{ v, chrome, domain }` blob under `namespace::key`, round trip, invalid or
    missing blobs return null, saved chrome is restored.
  - `utils/devtoolsUrlActivation.test.ts`: opens on `?devtools`, on a site-set param such as `?qetools` (and not on the default
    then), case-insensitive, inner-toggle param, param stripping without mutating the input.
  - `composables/useDevTools.test.ts` (`createDevToolsApi`): opens from the route query, from `window.location.search` and from
    a later navigation; persists dock position and restores it in a new instance; keeps the saved `domain`; writes nothing
    without `persist`; `disable()` strips the param (or leaves the URL alone when not opened by it).
  - `createStorage.test.ts` (moved with the code, 5 tests).
- `vitest.config.ts` gained a `fugueDevtoolsProject()` that aliases `#devtools`, the same way `fugueWorkflowProject()` aliases
  `#orchestrator`; isolated projects do not inherit the root alias.

## What changed in the fold (ticket 02) and what stayed

- Moved: persist helpers into `fugue-devtools/persist/`; storage code copied (`createStorage`, `StorageAPI`, `formatStorageKey`),
  with `@vueuse/core` inlined away (JSON parse/stringify), so persist imports nothing from Vue, Nuxt or VueUse.
- Deleted: `packages-fugue/fugue-devtools-persist/` and its dependency edge, lockfile entries and README lines.
- Kept: `fugue-storage` (now unused; owner decision to keep it for now) and every persist export, the `"./persist"` subpath and
  the persisted shape.
- Not changed: `alias.ts`, `tsconfig.packages.json`, `packages-platform/eslint-config/eslint.ts` (they never named persist).

## Not verified

- No browser run: the sandbox cannot reach localhost, and a typecheck or unit test does not show the drawer renders, docks or
  survives a reload. The tests drive `createDevToolsApi` with a stubbed `useRoute`, not the real Nuxt plugin or `Panel.vue`.
- The plugin (`plugins/fugue-devtools.client.ts`) and the dock components have no tests.
- Not checked: that a consumer outside this workspace can install and run the layer.

## Browser checklist (owner)

In a Nuxt app that extends `@altafusion/fugue-devtools` (in this repo, link it; for a real consumer such as the Camila site,
use a local checkout). Use the site's activation param: `?devtools` by default, or `?qetools` if it sets `openParams`.

1. Open the site with the param. The drawer opens. Check the console for errors.
2. Dock it to each side (top, right, bottom, left). Top and bottom are the wide docks; the layout should not overlap the page
   badly or break.
3. Reload the page *without* the param. The drawer should still open and in the same dock (state persisted).
4. In DevTools > Application > Local Storage, find the key `<persistNamespace>::<persistKey>` (default `app::devtools`). It
   should hold `{"v":1,"chrome":{...},"domain":{...}}`.
5. Close the drawer. If it was opened by the param, the param should disappear from the URL. Reload: it stays closed.
6. Reload with the param again: it opens, and the dock position is the last one you used.
7. Open the site without the param in a private window (no saved state): the drawer stays closed.

## Still needed before publishing `@altafusion/fugue-devtools`

Compared with `@altafusion/fugue-ui` (published 0.4.0), which has these:

- **Private flag and version:** `fugue-devtools` is `"private": true` at `0.1.0`. It is not in the `fixed` group in
  `.changeset/config.json`, so it would version on its own unless added. Needs a changeset.
- **`files` and `publishConfig`:** `fugue-ui` has `files: ['**', '!**/*.test.ts', ...]` and `publishConfig.access: public`;
  `fugue-devtools` has neither. Without `files`, the new `*.test.ts` files and any `.nuxt` or `.output` folders in the package directory would ship.
- **Layer dependency:** `nuxt.config.ts` does `extends: ['@altafusion/fugue-ui']`, but `fugue-ui` is only a `devDependency`.
  A consumer would not get it installed. It needs to be a `dependency`. `nuxt`, `vue` and `vue-router` are already peers.
- **Entry points:** exports point at raw `.ts` and the layer config, like the other published layers, so no build step is
  needed; confirm that is acceptable for consumers.
- **Release process:** `.github/workflows/release.yml` and changesets already publish the other packages; the new package
  must be added the same way (trusted publishing, tag push).
- **`minimumReleaseAge`:** this repo already excludes `@altafusion/*` in `pnpm-workspace.yaml`. A consumer such as
  `camilajalfonso/camilajessica` needs the same exclusion in its own pnpm config, or a first install of a brand-new version
  is blocked for a day.
- **First publish check:** run `pnpm pack` in `packages-fugue/fugue-devtools` and inspect the tarball before the first release.


## Publishing prep (2026-11-26)

Done in `build(fugue-devtools): add publish metadata and join the fixed release group`:
- `package.json`: added `license`, `homepage`, `bugs`, `repository` (with `directory`), `publishConfig.access: public` and the
  same `files` allow-list as `fugue-ui` (no `*.test.ts`, `.nuxt`, `.output`, `.data`, `coverage`, `node_modules`).
- `@altafusion/fugue-ui` moved from `devDependencies` to `dependencies` (the layer `extends` it).
- Added `@altafusion/fugue-devtools` to the `fixed` group in `.changeset/config.json`.
- `pnpm pack` checked: the tarball holds the layer, `persist/`, `utils/`, `plugins/`, `components/`, `assets/`, `LICENSE`, README;
  no tests or build output; `workspace:*` is rewritten to `0.4.0`. `pnpm install --frozen-lockfile` passes.

Deliberately NOT done (each one starts a release): `"private": true` is still set and there is no changeset. With the fixed group,
the first release would version `fugue-devtools` together with the other fixed packages (currently 0.4.0).
Still to do by the owner:
1. Remove `"private": true` and add a changeset (minor) for `@altafusion/fugue-devtools`.
2. npm side: configure trusted publishing for the new package name (`.github/workflows/release.yml`, OIDC). A brand-new npm
   package may need its first publish or a pending trusted publisher set up in npm settings first.
3. In each consumer, such as `camilajalfonso/camilajessica`, exclude `@altafusion/*` from `minimumReleaseAge`.
4. Try it in a consumer with the activation param (browser checklist above).
