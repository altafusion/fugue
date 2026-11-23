# @altafusion/nuxt-base

Platform Nuxt layer — shared modules, TypeScript, runtime defaults, Vite/Nitro baseline. Product layers (Fugue, design-system) **extend** this; apps extend those layers.

## Stack

Layer `nuxt.config.ts` registers **`sharedModules`** from **`./modules`**, plus **`sharedModuleConfig`**, **`sharedTypeScriptConfig`**, **`sharedRuntimeConfig`**, and **`sharedDevtoolsConfig`**. No SPA-only opts (e.g. `experimental.appManifest`) — apps opt in locally.

## Exports

| Subpath | Role |
|---------|------|
| `.` | **`createAppConfig`**, **`baseNuxtConfig`**, shared module/runtime re-exports, Nuxt UI theme helpers |
| `./modules` | **`sharedModules`**, devtools/runtime/module config |
| `./typescript` | Shared TS compiler options |
| `./dev/ports` | Canonical HTTP dev ports, `devViteServerOptions`, `pinDevServerHmr` |
| `./dev/open-browser`, `./dev/reuse-dev-browser`, `./dev/nuxt-dev` | Dev server / browser utilities |
| `./ui-theme` | **`buildNuxtUIConfig`**, palette → Nuxt UI token helpers |
| `./tsconfig.template.json` | Package TS baseline |

## Usage

**Extend the layer** (typical for packages):

```ts
export default defineNuxtConfig({
  extends: ['@altafusion/nuxt-base'],
})
```

**Merge in an app** via **`createAppConfig`** (optional theme CSS, Nuxt UI tokens, dev browser reuse):

```ts
import { createAppConfig } from '@altafusion/nuxt-base'

export default createAppConfig(
  { /* app overrides */ },
  { theme: 'default', enableNuxtUI: true },
)
```

ESLint factories live in **`@altafusion/eslint-config`**, not here.

## Consumers

> **Local — do not copy-sync.** Repo wiring, ports, catalog keys, consuming apps, and docs-site links.

- **`createAppConfig({ theme, enableNuxtUI, … })`** — used by Altafusion product apps and **`templates/*`**. HMR stays on each app’s HTTP dev port via **`devViteServerOptions()`** / **`pinDevServerHmr`** inside **`createAppConfig`**; apps that do not use **`createAppConfig`** (e.g. a Docus site) set **`vite.server`** with **`devViteServerOptions()`** directly. Port **7003** is reserved for the first site copied from **`templates/fugue-content-site`**.
- **`devPorts`** / **`templateDevPorts`** — canonical HTTP ports for this monorepo (`developerDocs`, …); sites pass their own port to `nuxt-dev.mjs`.
- Downstream chain: **`@altafusion/fugue-nuxt-ui`** → Fugue family → **`@altafusion/shell`** / **`@altafusion/fugue-content`** on consumer apps.
