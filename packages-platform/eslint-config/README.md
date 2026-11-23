# @altafusion/eslint-config

Platform-tier ESLint factories on **`@antfu/eslint-config`** — stylistic defaults stay aligned with **`sharedModuleConfig.eslint`** in **`@altafusion/nuxt-base`** (consumed by **`@nuxt/eslint`**).

**Hybrid:** Nuxt apps use **`@nuxt/eslint`** via a layer they directly extend; packages run standalone **`eslint .`** with the factories below.

## Factories

- **`createPackageEslintConfig`** — TS/JS packages; **`importPathRules`** (deep-relative guard).
- **`createVuePackageEslintConfig`** — Vue SFC packages + shared Vue block rules.
- **`createStrictVuePackageEslintConfig`** — stricter prop-type / unused-component checks (Fugue UI layers).
- **`createNuxtAppEslintConfig`** — Docus-style apps; pair with generated **`.nuxt/eslint.config.mjs`**.

Shared exports: **`sharedStylisticDefaults`**, **`sharedVueSfcRules`**, **`strictVueComponentRules`**, **`importPathRules`**.

```js
import { createPackageEslintConfig } from '@altafusion/eslint-config'

export default createPackageEslintConfig()
```

## Consumers

> **Local — do not copy-sync.** Repo wiring, ports, catalog keys, consuming apps, and docs-site links.

- Consumed by **`@altafusion/nuxt-base`** and every **`packages-platform/*`** / **`packages-fugue/*`** package **`eslint.config.mjs`**.
- Catalog: **`catalog:dev`** for **`eslint`** / **`@antfu/eslint-config`**.
