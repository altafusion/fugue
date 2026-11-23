# @altafusion/fugue-theme

Optional **theme and tokens** module in the **Fugue** design system (`packages-fugue/*`).

- Extends **`@altafusion/fugue-nuxt-ui`** with product-agnostic semantic tokens, Nuxt UI theme CSS, and Tailwind **`@theme`** wiring.
- Unbranded stacks and the workflow playground can omit this layer.

Canonical CSS entry: **`themes/theme.css`** (package **`exports`**). **`colorMode.dataValue`** is **`theme`** (aligns with **`[data-theme="dark"]`** tokens).

## Usage

```ts
export default defineNuxtConfig({
  extends: ['@altafusion/fugue-theme', '@altafusion/fugue-ui'],
})
```

## Consumers

> **Local — do not copy-sync.** Repo wiring, ports, catalog keys, consuming apps, and docs-site links.

- Altafusion product apps (**`templates/fugue-content-site`**, **`packages-consumer/fugue-content`**) extend here for tokens; **product brand** (logos, `--*` brand vars) lives in **`@altafusion/shell`**, not this package.
- **`templates/docus-site`** doc sites use Docus chrome — they do **not** require fugue-theme.
