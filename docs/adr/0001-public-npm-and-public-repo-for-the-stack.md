---
status: accepted
---

# The Stack Is Public: MIT Packages on npm, Built in the Open

The nine `@altafusion/*` stack packages are published to npmjs under the `altafusion` org with the MIT license
(`Copyright (c) 2026 Altafusion`). Their source lives in this public repo, `altafusion/fugue`, which owns releases
(Changesets), and later trusted publishing and provenance.

## Considered Options

- **Private registry (GitHub Packages or a paid private npm scope).** Rejected: every site owner needs a token wired into
  `.npmrc`, Netlify and CI, and access errors read as 404 or 403. The stack has nothing secret in it.
- **Public npm, source kept private.** Rejected: package pages link to no source, and npm provenance is unavailable.

## Consequences

- Site owners install with no token and no registry `.npmrc` (see `docs/site-owners.md`).
- Publishing is hard to undo: npm restricts unpublish, so a bad release is fixed forward with a new version.
- This repo starts from a single initial commit; earlier history is not published.
- Names, branding and comments in the packages are public.
