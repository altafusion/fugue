---
"@altafusion/fugue-devtools": patch
---

Tidy the Diagnostics section and list the site's `@altafusion/*` packages.

- Diagnostics is two `UCard`s like Studio Drafts: **Page** (url, viewport, theme, language, user agent, and a Copy Diagnostics button) and **Altafusion Packages**.
- The packages card reads each installed `@altafusion/*` package and its version from the site's `node_modules` at build time (into `runtimeConfig.public.fugueDevtools.packages`). When they all share one version it says so once ("All 10 packages are on version 0.6.3") and shows the names as badges; mixed versions are grouped. The copied diagnostics include the list.
- Removed the "Turn off dev tools" button from Diagnostics: the drawer header already has the turn-off control.
