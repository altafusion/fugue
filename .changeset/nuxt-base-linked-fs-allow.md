---
'@altafusion/nuxt-base': patch
---

Allow a linked Fugue checkout in Vite's `server.fs.allow`. With `pnpm link:fugue`, Nuxt Content's `sqlite3.wasm` is served from the checkout's `node_modules`, which Vite blocked (403), so a client-side navigation to a content page failed with "Failed to load content." Installed from npm, nothing changes.
