# Give the Site Onboarding Checklist One Home

Status: ready-for-human
Type: task
Blocked by: none

The steps exist in several places (the template `README`, a Studio access setup page, a pilot deploy checklist, `docs/site-owners.md`)
and none of them has the lessons from onboarding the first sites end to end. Pick one canonical checklist (the template `README` or
`docs/` in the template repo), make the others point to it, and follow it once end to end on the next site.

## Scope

- Merge the onboarding path into the canonical checklist, including the gotchas: the Studio token must be created by the repo owner
  (a token from another account gives a 404 on a private repo), `rootDir` is `''`, the pnpm version is pinned with `packageManager`,
  and `build.transpile` is set when the drawer component is used.
- Replace the body of `docs/site-owners.md` and any overlapping docs pages with a pointer.
- Acceptance: the next site is onboarded from the checklist alone, and anything missing is fed back.

## Comments
