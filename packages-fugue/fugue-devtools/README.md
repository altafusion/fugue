# @altafusion/fugue-devtools

Nuxt layer for a **generic non-modal dev tools drawer** — part of the **Fugue** family (`@altafusion/fugue-ui`, …). Project adapters supply domain sections, visibility rules, and persisted flag state.

## Stack

```text
@altafusion/fugue-devtools
  extends → @altafusion/fugue-ui → @altafusion/fugue-nuxt-ui → @altafusion/nuxt-base
```

Optionally extend **`@altafusion/fugue-theme`** alongside Fugue layers. **`@nuxt/eslint`** requires a direct extend of **`fugue-nuxt-ui`**, **`fugue-theme`**, or another layer that registers the module (see **`packages-platform/nuxt-base/modules.ts`**).

## Usage

```ts
export default defineNuxtConfig({
  extends: ['@altafusion/fugue-theme', '@altafusion/fugue-devtools'],
  runtimeConfig: {
    public: {
      fugueDevtools: {
        openParams: ['devtools'],
        innerToggleParams: ['devtoolstoggle'],
      },
    },
  },
})
```

Components auto-import from **`components/DevTools/`**: **`DevToolsPanel`**, **`DevToolsNav`**, **`DevToolsSection`**, **`DevToolsToggleButton`**.

Composables: **`useDevTools()`** (chrome: open, dock position) — register via the layer plugin or a project adapter that merges domain state.

## Component naming

Shell components live under **`components/DevTools/`** (folder namespace → **`DevTools*`** tags). Do not flatten to **`Panel.vue`** at layer root. Product-specific panels use their own adapter namespace (e.g. **`QeTools/*`** in a product adapter package).

## Consumers

> **Local — do not copy-sync.** Repo wiring, ports, catalog keys, consuming apps, and docs-site links.

- Altafusion product adapters register domain sections at the app layer; tune **`openParams`** / **`registerPlugin`** per app.
- Persist helpers live in this package under **`persist/`** (subpath **`@altafusion/fugue-devtools/persist`**, imported inside the layer as **`#devtools/persist`**). They do not import Vue or Nuxt.
