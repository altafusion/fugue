# @altafusion/fugue-nuxt-ui

Unbranded Nuxt UI + Tailwind base for the Fugue family — **`@nuxt/ui`**, **`@nuxt/eslint`**, no product fonts or brand tokens.

## Stack

```text
@altafusion/fugue-nuxt-ui
  extends → @altafusion/nuxt-base
  modules → @nuxt/eslint, @nuxt/ui
  css     → assets/css/nuxt-ui.css
```

Apps must **directly extend** a layer that registers **`@nuxt/eslint`** (this layer, **`@altafusion/fugue-theme`**, or another layer that pulls it in) so the app-root ESLint hook runs. Optional **`@altafusion/fugue-theme`** adds semantic tokens on top.

## Usage

```ts
export default defineNuxtConfig({
  extends: ['@altafusion/fugue-nuxt-ui'],
})
```

Export **`./assets/css/nuxt-ui.css`** for non-Nuxt consumers that need the same entry.

## Consumers

> **Local — do not copy-sync.** Repo wiring, ports, catalog keys, consuming apps, and docs-site links.

- Extended by **`@altafusion/fugue-ui`** and **`@altafusion/fugue-theme`**; product apps and **`templates/fugue-content-site`** typically extend theme and/or **`@altafusion/shell`** (shell → fugue-ui → here).
