# 03: Verify and report

Status: ready-for-agent
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

(append here, then set `Status: resolved`)
