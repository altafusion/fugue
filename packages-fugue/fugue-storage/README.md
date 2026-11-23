# @altafusion/fugue-storage

Namespaced **localStorage** helpers for fugue packages (devtools persist, CMS prefs, etc.).

Built on **[VueUse](https://vueuse.org/)** — `@vueuse/core` for serialization and reactive storage; optional `@vueuse/nuxt` layer for auto-imports.

## Key format

```text
{namespace}::{key}
```

Example: namespace `demo`, key `note` → `demo::note`

Same key shape as `@altafusion/fugue-devtools` persist.

## Usage

```ts
import { createStorage, useNamespacedStorage } from '@altafusion/fugue-storage'
```

See package source for **`useNamespacedStorage`** usage.

## Consumers

> **Local — do not copy-sync.** Repo wiring, ports, catalog keys, consuming apps, and docs-site links.

- **`@altafusion/fugue-devtools`** persist namespace keys. No app demos this package today.
