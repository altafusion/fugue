# Explore a Doctor or CLI for Site Onboarding

Status: needs-triage
Type: research
Blocked by: 01

Explore documenting and automating the onboarding path, maybe as a package here (a CLI plus a `doctor` command). A doctor would check,
for a given site: the Studio token can see the repo (404 means wrong owner or scope); `rootDir` is `''`; Netlify env var scopes;
`build.transpile` when `UDrawer` is used; no leftover `nuxt-studio@1.8.2` patch on `fugue-content` 0.3.5 or later
(`ERR_PNPM_UNUSED_PATCH`). Decide after the next site is onboarded and shows which steps repeat.

## Comments
