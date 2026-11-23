# @altafusion/fugue-workflow

Nuxt layer for a **domain-free workflow orchestrator** (engine, YAML schema, composables) and **generic wizard UI** (`WorkflowWizard*`) — part of the **Fugue** family (`@altafusion/fugue-ui`, `@altafusion/fugue-devtools`, …).

Public API: import engine types and registry hooks via **`#orchestrator`**. Route helpers — **`resolveWorkflowFromSources`**, **`isPathOwnedByWorkflow`**, **`WorkflowLoadFailure`** — on the same barrel. Product YAML, handler registries, and route wiring live in **app layers**, not in this package.

## Stack

```text
@altafusion/fugue-workflow
  extends → @altafusion/fugue-ui → @altafusion/fugue-nuxt-ui
  modules → @pinia/nuxt
  alias    → #orchestrator
```

For **`@nuxt/eslint`**, directly extend **`@altafusion/fugue-nuxt-ui`**, **`@altafusion/fugue-ui`**, **`@altafusion/fugue-theme`**, or any layer that registers **`@nuxt/eslint`** (see **`packages-platform/nuxt-base/modules.ts`**).

## Usage

```ts
export default defineNuxtConfig({
  extends: ['@altafusion/fugue-theme', '@altafusion/fugue-workflow'],
})
```

Wizard components auto-import from **`app/components/`**: **`WorkflowWizardShell`**, **`WorkflowWizardStepper`**, **`WorkflowWizardField`**, … Composables: **`useWorkflow`**, **`useWorkflowContext`**.

## Playground

Private dev app **`@altafusion/fugue-workflow-playground`** at **`./playground/`** (extends this layer only).

## Tests

From workspace root **`frontend/`**:

```bash
pnpm --filter @altafusion/fugue-workflow test
pnpm --filter @altafusion/fugue-workflow test:e2e
pnpm --filter @altafusion/fugue-workflow test:e2e:headed
pnpm --filter @altafusion/fugue-workflow test:e2e:ui
```

From this package: **`pnpm test`** / **`pnpm test:e2e`** (plus **`test:e2e:headed`**, **`test:e2e:ui`**, **`test:e2e:debug`**).

## Consumers

> **Local — do not copy-sync.** Repo wiring, ports, catalog keys, consuming apps, and docs-site links.

- Product workflow YAML and handlers live in the consuming app, not in this package.
- Optionally extend **`@altafusion/fugue-theme`** for wizard **`--workflow-*`** tokens; TS defaults in **`app/theme/`**.
