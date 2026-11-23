# @altafusion/msw

Shared **MSW infrastructure** for Altafusion apps — not a monolithic mock API.

## What lives here

| Export | Role |
|--------|------|
| `startBrowserMsw` | Browser worker bootstrap |
| `createNodeMswServer` | Vitest / Node (`@altafusion/msw/node`) |
| `isMswEnabled` | Gate from `runtimeConfig.public` or Vite env |
| `initMockDb` / `resetMockDb` | Tab or shared mutable fixtures (`namespace` per app) |
| `jsonResponse` | Thin `HttpResponse.json` helper |
| `healthHandlers` | Optional shared probe routes |
| `altafusionMswViteAliases` | Live-edit package source during dev |

**App-specific handlers do not belong in this package** unless they are truly identical across products.

## Multi-app strategy

Altafusion apps are expected to have **distinct APIs**, so split responsibilities:

```text
@altafusion/msw (packages-platform)     ← toolkit only
        ↑
   app mocks (handlers + fixtures)
```

| Stage | Where handlers live | When |
|-------|---------------------|------|
| **1 — first app** | `apps/<app>/app/mocks/handlers/` | Distinct API, single consumer |
| **2 — handlers grow** | `packages-consumer/<app>-msw/` | Large handler tree, Vitest without Nuxt, or reuse across routes |
| **3 — shared backend** | `@altafusion/msw/handlers/shared/` | Only probes/utilities every app needs (health, common errors) |

Use a **unique mock DB namespace** per app (`initMockDb('my-app', 'items', seed)`).

Promote from app → consumer package when:

- Handler files exceed ~10–15 or need dedicated Vitest projects
- A second app must share the same mock API
- You want MSW tests without booting the full Nuxt app

Do **not** fold unrelated app APIs into `@altafusion/msw` — that couples unrelated products to one mock backend.

## Nuxt app wiring (template)

```bash
# once per app
pnpm --filter @altafusion/my-app exec msw init public/ --save
```

```ts
// nuxt.config.ts
runtimeConfig: {
  public: {
    mswEnabled: process.env.NUXT_PUBLIC_MSW_ENABLED === 'true',
    serverEnabled: process.env.NUXT_PUBLIC_SERVER_ENABLED === 'true',
  },
},
```

```ts
// app/mocks/handlers/index.ts
import { http } from 'msw'
import { healthHandlers, jsonResponse } from '@altafusion/msw'

export const myAppHandlers = [
  ...healthHandlers,
  http.get('/api/items', () => jsonResponse([{ id: '1', title: 'Sample' }])),
]
```

```ts
// app/mocks/browser.ts
import { startBrowserMsw } from '@altafusion/msw'
import { myAppHandlers } from './handlers'

export async function startMyAppMsw() {
  return startBrowserMsw({
    handlers: myAppHandlers,
    serviceWorkerUrl: '/mockServiceWorker.js',
  })
}
```

```ts
// app/plugins/msw.client.ts
import { isMswEnabled } from '@altafusion/msw'
import { startMyAppMsw } from '~/mocks/browser'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  if (!isMswEnabled(config.public))
    return
  await startMyAppMsw()
})
```

Dev: `NUXT_PUBLIC_MSW_ENABLED=true pnpm dev:my-app`

## Mock DB scope

`VITE_MSW_MOCK_DB` controls where `initMockDb` persists mutations:

| Value | Storage | Cross-tab |
|-------|---------|-----------|
| unset / invalid / `tab` | `sessionStorage` | No (default) |
| `shared` | `localStorage` | Yes — `BroadcastChannel` rehydrate |

After switching modes or stale e2e data, clear **both** storages for keys matching `*::mock-db::*` (or call `resetMockDb(namespace, key)`).

## Vitest (handler unit tests)

```ts
import { createNodeMswServer } from '@altafusion/msw/node'
import { myAppHandlers } from '../handlers'

const server = createNodeMswServer(myAppHandlers)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## Live-edit handlers (optional)

In app `nuxt.config.ts` Vite hook:

```ts
import { altafusionMswViteAliases, mergeAltafusionMswServerFs } from '@altafusion/msw/vite-aliases'
```

See **`vite-aliases.ts`** in this package for app-local handler aliases when promoting to `packages-consumer/<app>-msw`.
