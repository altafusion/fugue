# @altafusion/fugue-devtools-persist

Framework-agnostic devtools persist helpers (chrome + versioned domain blob) on **`@altafusion/fugue-storage`**. No Nuxt/Vue peers.

## API

- **`getDevToolsStorage(namespace)`** — namespaced storage via fugue-storage.
- **`readDevToolsPersisted` / `writeDevToolsPersisted`** — typed **`DevToolsPersistedV1<TDomain>`** blob.
- **`readDevToolsChrome` / `writeDevToolsChrome`** — dock/open chrome with defaults in dev.
- Types: **`DevToolsChromeState`**, **`DevToolsPanelPosition`**, **`DEVTOOLS_PERSIST_VERSION`**, guards **`isDevToolsPersistedV1`**, **`isDevToolsPanelPosition`**, **`isHorizontalDevToolsDock`**.

```ts
import {
  getDevToolsStorage,
  readDevToolsPersisted,
  writeDevToolsPersisted,
} from '@altafusion/fugue-devtools-persist'
```

## Consumers

> **Local — do not copy-sync.** Repo wiring, ports, catalog keys, consuming apps, and docs-site links.

- Used by **`@altafusion/fugue-devtools`** runtime defaults (`persistNamespace` / `persistKey` in layer config); product adapters can swap storage wiring at the app layer.
