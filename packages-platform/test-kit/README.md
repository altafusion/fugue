# @altafusion/test-kit

Platform test kit — Vitest, Playwright E2E, and Nuxt test utils presets. Pattern inspired by [UnoCSS](https://github.com/unocss/unocss) centralized configuration.

## Exports

- **`baseTestConfig`** — mergeable base Vitest config (globals, coverage, env, timeouts)
- **`sharedVitestConfig`** — full **`defineConfig`** using base
- **`defineVueAppVitestConfig`** — single-call preset for app-local Vitest (`happy-dom`, `@vitejs/plugin-vue`)
- **`defineVitestProject`**, **`defineVitestConfig`** — from **`@altafusion/test-kit/nuxt`** for Nuxt runtime tests (optional peer **`@nuxt/test-utils`**)
- **`defineFrontendPlaywrightConfig`** — from **`@altafusion/test-kit/playwright`** (Chromium + WebKit)

## Usage

### Root vitest.config.ts

Keep **every package and app that contains tests** under **`test.projects`** so root **`pnpm test`** matches CI.

Nuxt runtime tests: **`defineVitestProject`** from **`@altafusion/test-kit/nuxt`**. Add **`@nuxt/test-utils`** on that app. Vitest supports an async factory:

```ts
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { baseTestConfig } from '@altafusion/test-kit'
import { defineVitestProject } from '@altafusion/test-kit/nuxt'

export default defineConfig(async () => ({
  test: {
    ...baseTestConfig,
    projects: [
      await defineVitestProject({
        test: {
          include: ['apps/<app>/**/*.{test,spec}.ts'],
          environment: 'nuxt',
          environmentOptions: {
            nuxt: {
              rootDir: fileURLToPath(new URL('./apps/<app>', import.meta.url)),
            },
          },
        },
      }),
    ],
  },
}))
```

### Vue component tests

Packages with **`.vue`** files need **`@vitejs/plugin-vue`**:

```ts
import vue from '@vitejs/plugin-vue'

{
  plugins: [vue()],
  test: {
    name: 'design-system',
    include: ['packages-fugue/fugue-theme/**/*.{test,spec}.{ts,tsx}'],
    environment: 'happy-dom',
  },
}
```

### Per-app vitest.config.ts

```ts
import { defineVueAppVitestConfig } from '@altafusion/test-kit'

export default defineVueAppVitestConfig()
```

### Per-package vitest.config.ts

```ts
import { defineConfig } from 'vitest/config'
import { baseTestConfig } from '@altafusion/test-kit'

export default defineConfig({
  test: {
    ...baseTestConfig,
    include: ['**/*.{test,spec}.ts'],
  },
})
```

## Dependencies

- **`vitest`**, **`@vitejs/plugin-vue`** — declared alongside this package in consumers
- **`@nuxt/test-utils`** — optional peer for **`@altafusion/test-kit/nuxt`**
- **`@vue/test-utils`**, **`happy-dom`**, **`msw`**, **`@vitest/coverage-v8`**, **`@vitest/ui`**

## Consumers

> **Local — do not copy-sync.** Repo wiring, ports, catalog keys, consuming apps, and docs-site links.

- Root **`vitest.config.ts`** includes fugue packages, **`packages-consumer/fugue-content`**, **`templates/fugue-content-site`**, etc.
- **`defineFrontendPlaywrightConfig()`** default base URL targets the starter template preview (**`http://127.0.0.1:8001/`**) — see root **`playwright.config.ts`** and **`templateDevPorts.fugueContentSite`** in **`@altafusion/nuxt-base/dev/ports`**.
