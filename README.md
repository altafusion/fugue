# Fugue

Nuxt layers and starter templates for content sites, published to npm as [`@altafusion/*`](https://www.npmjs.com/org/altafusion) under the MIT license.

---

## Repository layout

```text
fugue/
├── packages-platform/
│   ├── eslint-config/         # @altafusion/eslint-config
│   ├── msw/                   # @altafusion/msw
│   ├── nuxt-base/             # @altafusion/nuxt-base
│   └── test-kit/              # @altafusion/test-kit
├── packages-fugue/
│   ├── fugue-devtools/        # @altafusion/fugue-devtools
│   ├── fugue-nuxt-ui/         # @altafusion/fugue-nuxt-ui
│   ├── fugue-simple-auth/     # @altafusion/fugue-simple-auth
│   ├── fugue-storage/         # @altafusion/fugue-storage
│   ├── fugue-theme/           # @altafusion/fugue-theme
│   ├── fugue-ui/              # @altafusion/fugue-ui
│   └── fugue-workflow/        # @altafusion/fugue-workflow
├── packages-product/
│   └── shell/                 # @altafusion/shell
├── packages-consumer/
│   └── fugue-content/         # @altafusion/fugue-content
└── templates/
    ├── fugue-content-site/              # @altafusion/fugue-content-site-template — Fugue Content Starter
    └── docus-site/            # @altafusion/docus-site-template
```

## Playgrounds

Private Nuxt apps for trying a package in a browser. They are never published, and each extends only the layers it exercises.

| Command | Package | Port | What it shows |
|---|---|---|---|
| `pnpm play:ui` | `packages-fugue/fugue-ui/playground` | 7011 | fugue-ui components on Nuxt UI alone, with no theme or shell: one page per component, such as the `FloatingDock` |
| `pnpm play:theme` | `packages-fugue/fugue-theme/playground` | 7010 | fugue-theme tokens and text roles with the shell chrome, in light and dark |

Both scripts run the playground's `dev` script through `pnpm --filter`. Ports come from `packages-platform/nuxt-base/dev/ports.ts`. A new component in fugue-ui gets a page in its playground; theming work belongs in the theme playground.

**Layer chain:** `nuxt-base` → `fugue-nuxt-ui` → `fugue-theme` / `fugue-ui` → `shell` → product apps from **`templates/fugue-content-site`**.


> **Note:** Docus and `@nuxt/content` use a SQLite runtime that fails to resolve under pnpm's default symlinked `node_modules`. Root **`pnpm-workspace.yaml`** sets **`nodeLinker: hoisted`** (pnpm 11+; not `.npmrc`). If you remove that setting, Docus-based sites break at runtime.

---

## Sharing Nuxt modules / layers across apps

### 1 — Create a shared layer in the appropriate bucket

Each package under `packages-platform/`, `packages-product/`, `packages-fugue/`, or `packages-consumer/` that contains a `nuxt.config.ts` is treated by
Nuxt as a **layer**. See [README.packages.md](./README.packages.md) for bucket rules. A layer can expose:

| Directory      | What Nuxt does with it                          |
|----------------|-------------------------------------------------|
| `components/`  | Globally auto-imports every Vue component       |
| `composables/` | Auto-imports every exported composable          |
| `utils/`       | Auto-imports every exported utility function    |
| `plugins/`     | Registers plugins (`.client` / `.server` aware)  |
| `middleware/`  | Registers route middleware                      |
| `server/`      | Merges server routes, middleware, and utilities |
| `pages/`       | Adds pages to the router                        |
| `layouts/`     | Adds layouts                                    |
| `assets/`      | Merges static assets                            |

Give the package a proper `name` in its `package.json` so apps can reference it
by name instead of a file path:

```json
// packages-fugue/fugue-theme/package.json
{
  "name": "@altafusion/fugue-theme",
  "main": "./nuxt.config.ts"
}
```

### 2 — Register the internal package in `pnpm-workspace.yaml`

Use a named **catalog** to keep the workspace version in a single place:

```yaml
# pnpm-workspace.yaml
catalogs:
  internal:
    "@altafusion/fugue-theme": "workspace:*"
    "@altafusion/nuxt-base": "workspace:*"
    "@altafusion/test-kit": "workspace:*"
```

### 3 — Declare the dependency in each app

```json
// templates/fugue-content-site/package.json
{
  "name": "@altafusion/fugue-content-site-template",
  "dependencies": {
    "@altafusion/fugue-theme": "workspace:*",
    "@altafusion/shell": "workspace:*",
    "@altafusion/fugue-content": "workspace:*"
  }
}
```

`workspace:*` tells pnpm to symlink the local package folder instead of downloading from npm.

### 4 — Extend layers in `nuxt.config.ts`

Product apps **directly extend `@altafusion/fugue-theme`** (required for `@nuxt/eslint` to emit `.nuxt/eslint.config.mjs`) plus consumer layers such as `@altafusion/shell`:

```ts
// templates/fugue-content-site/nuxt.config.ts
export default defineNuxtConfig(defineFugueContentSite({
  // site.config.ts, content/, …
}))
```

`@altafusion/shell` extends `fugue-ui` → `fugue-nuxt-ui` — the direct `fugue-theme` extend is still required for ESLint and theme tokens on the app root.

Nuxt resolves the `extends` array from **last to first** — the current app
always has the highest priority. You can override any layer file by placing a
file at the same relative path inside the app directory.

### 5 — Use shared code without any imports

```vue
<template>
  <!-- BaseButton lives in packages-product/shell/components/ -->
  <BaseButton variant="primary">Save</BaseButton>
</template>

<script setup lang="ts">
// useTheme lives in packages-fugue/fugue-theme/composables/
const { isDark, toggleTheme } = useTheme()

// formatDate lives in packages-product/shell/utils/
const label = formatDate(new Date())
</script>
```

---

## Adding a new shared layer

1. Choose a bucket — see [README.packages.md](./README.packages.md) — then `mkdir -p packages-fugue/my-layer` (or `packages-product/`, `packages-consumer/`)
2. Create `package.json` with `"name": "@altafusion/my-layer"` and `"main": "./nuxt.config.ts"`
3. Create `nuxt.config.ts` with `export default defineNuxtConfig({})`
4. Add `"@altafusion/my-layer": "workspace:*"` to the `internal` catalog in `pnpm-workspace.yaml`
5. Declare `"@altafusion/my-layer": "workspace:*"` in the app's `package.json`
6. Add `'@altafusion/my-layer'` to the `extends` array in the app's `nuxt.config.ts`
7. Run `pnpm install` from the repo root

---

## Prerequisites

- **Node.js** ≥ 24 (see `.nvmrc` / `.node-version`; `pnpm install` fails on older versions via **`engineStrict: true`** in **`pnpm-workspace.yaml`**)
- **pnpm** 12 — use Corepack: `corepack enable && corepack prepare`

---

## Development

```bash
# install all dependencies
pnpm install

# start an app in dev mode
pnpm dev:fugue-content-site

# build an app
pnpm build:fugue-content-site

# lint (workspace-wide or per app)
pnpm lint
pnpm lint:fix
pnpm lint:fugue-content-site

# type check (workspace-wide or per app)
pnpm typecheck
pnpm typecheck:fugue-content-site

# unit tests (Vitest — all projects in vitest.config.ts)
pnpm test
pnpm test:watch
pnpm test:ui
pnpm test:coverage

# E2E tests (Playwright — builds starter template and serves preview unless PLAYWRIGHT_BASE_URL is set)
pnpm exec playwright install chromium   # first-time browser install
pnpm test:e2e
pnpm test:e2e:chromium
pnpm test:e2e:headed

# remove build artifacts only (keeps node_modules)
pnpm clean:nuxt

# full reset: artifacts, node_modules, reinstall, nuxt prepare
pnpm reset
```

Root **`alias.ts`** and **`tsconfig.packages.json`** centralize Vitest aliases and TypeScript `paths` for workspace packages. Keep them in sync when adding virtual import scopes such as `#devtools` or `#msw`.

---

## Linting

Hybrid ESLint setup:

| Context | Preset | Config |
|---------|--------|--------|
| **Nuxt apps** (`templates/*`) | `@nuxt/eslint` | `templates/*/eslint.config.mjs` → `.nuxt/eslint.config.mjs` |
| **Workspace packages** | `@antfu/eslint-config` | `packages-*/**/eslint.config.mjs` via `@altafusion/eslint-config` |

Shared factories, Vue SFC rules, import-path guards, and stylistic defaults live in **`packages-platform/eslint-config.ts`**. Stylistic values come from **`sharedStylisticDefaults`** and feed both Antfu packages and **`sharedModuleConfig.eslint`** (consumed by `@nuxt/eslint`).

| Concern | Owner |
|---------|--------|
| Rule factories (`createPackageEslintConfig`, `createStrictVuePackageEslintConfig`, …) | `@altafusion/eslint-config` |
| `@nuxt/eslint` module (generates `.nuxt/eslint.config.mjs`) | **`@altafusion/fugue-theme`** (extends **`fugue-nuxt-ui`**) |
| `@nuxt/ui` module | **`@altafusion/fugue-nuxt-ui`** / **`fugue-theme`** chain |
| App overrides (`sharedVueSfcRules`, `vue/max-attributes-per-line`, …) | Each app's `eslint.config.mjs` |

**Important:** Apps must **directly extend `@altafusion/fugue-theme`** (or **`@altafusion/fugue-nuxt-ui`**) in `nuxt.config.ts` — registering `@nuxt/eslint` only on a nested layer does not emit `.nuxt/eslint.config.mjs` in the app. See `packages-platform/nuxt-base/modules.ts`.

```bash
pnpm lint              # all packages and apps (recursive)
pnpm lint:fix          # auto-fix across the workspace

# single app (requires .nuxt/eslint.config.mjs from postinstall / nuxt prepare)
pnpm --filter @altafusion/fugue-content-site-template lint
pnpm --filter @altafusion/fugue-content-site-template exec nuxt prepare   # refresh generated eslint config
```

Nuxt apps run **`nuxt prepare`** on **`postinstall`** so `.nuxt/eslint.config.mjs` exists after `pnpm install`. Re-run prepare after layer or eslint config changes.

---

## Commit format

Commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

# Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
```

Example: `feat(shell): add login page`

---

## Key rules

- **One source of truth** — shared code lives in package buckets (`packages-platform/`, `packages-fugue/`, etc.), never duplicated across apps.
- **No manual imports** — Nuxt's auto-import handles components, composables, and utils from every extended layer.
- **Override locally** — mirror the file path inside the app to shadow a layer's file.
- **Isolated versions** — each app pins its own Nuxt version via `catalog:apps`; layers only have a `peerDependency` on Nuxt.
- **pnpm catalogs** — all versions live in `pnpm-workspace.yaml`; apps reference them with `catalog:<name>` to avoid drift.
