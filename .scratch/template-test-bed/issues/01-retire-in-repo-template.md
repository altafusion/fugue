# Retire `templates/fugue-content-site` in This Repo?

Status: needs-triage (raised 2026-11-25; not decided, nothing started)
Type: grilling
Blocked by: none

This repo still carries `templates/fugue-content-site`, a workspace copy of the template. A standalone
`altafusion/fugue-content-site-template` now exists and installs the published stack (0.3.5). The earlier decision was to keep the
in-repo copy as the stack's test bed; this ticket reopens that.

Why it is not a plain delete (checked 2026-11-25):
- It is a workspace package (`pnpm-workspace.yaml:9`), so it builds against local `packages-*` source. The standalone template uses
  npm, so the in-repo copy is the only place to try unreleased stack changes against a real site. (`pnpm link:fugue`, added to the
  standalone template on 2026-11-25, now covers that need for local testing.)
- `packages-platform/nuxt-base/dev/ports.test.ts:25` reads its `scripts/dev.mjs`.
- Vitest project (`vitest.config.ts:103`) and Playwright e2e (`e2e/fugue-content-site`, `playwright.config.ts:10`) run against it.
- About 8 `*:fugue-content-site` root scripts; root `README.md` and `README.packages.md` list it; `nuxt-base` README and `ports.ts`
  say port 7003 is reserved for sites copied from it.
- The two copies already drifted: the standalone one has the real content, `.npmrc`, `.nvmrc`, `CLAUDE.md`, a lockfile and the
  Studio `rootDir` fix (`c9271e7`); the in-repo one has none of the recent fixes.

Steps if we retire it:
1. Decide where the pre-release check against local packages lives: the standalone template with `link:fugue`, or a small fixture
   inside this repo.
2. Move or drop the e2e and Vitest project; make `ports.test.ts` stop reading the deleted folder.
3. Delete the folder and root scripts; fix the workspace entry, READMEs and the 7003 comments in `nuxt-base`.
4. Changeset and PR.

## Comments
