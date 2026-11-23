# fugue-workflow-playground

Standalone Nuxt app extending only `@altafusion/fugue-workflow` (no product-specific layers). Proves the orchestrator layer boots and runs end-to-end.

## Run

```bash
pnpm --filter @altafusion/fugue-workflow-playground dev
# or from this directory: pnpm dev
# or via the layer package: pnpm --filter @altafusion/fugue-workflow dev
```

Open `/onboarding` for the sample workflow.

## E2E (Playwright)

Playground-only — not part of workspace-wide app e2e.

```bash
pnpm --filter @altafusion/fugue-workflow-playground test:e2e
# same E2E via layer: pnpm --filter @altafusion/fugue-workflow test:e2e
# watch on screen: test:e2e:headed or test:e2e:ui (layer or playground filter)
# chromium only; boots `nuxt dev` on port 34567 via playwright.config.ts
```

Override server URL: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:34567/ pnpm --filter @altafusion/fugue-workflow-playground test:e2e`

## User onboarding flow

YAML: `app/workflows/user-onboarding.yaml`. Exercises:

- Context: `globals`, `persist`, `basePath`, stepper `navigable` / `closable` / `order: transition`
- Inputs: `tiles` (feature variant on role), `select` + `source.effect: fetch`, pin-area toggles on resources (no multi-select tiles), `text` + `validate`, toggles, `when` guard on a field
- Routing: conditional transitions (`role == 'admin'`), drawer step skip for non-admins, `requires` / `produces`, `invalidatesDownstream`
- Presentation: `presentation: drawer` (workspace focus), drawer config (`side`, `relocatable`)
- Submit: `actions` with `effect: mutate`, `onError: stay`, transition on `submit.success`; recoverable error via home label `INVALID-RECOVER`

## Coupling found

1. **Pinia** — The layer used `defineStore` but did not register `@pinia/nuxt`; it only worked when another layer registered Pinia first. Fixed: `@pinia/nuxt` is now in the fugue-workflow layer.
2. **Tailwind + Nuxt UI CSS** — Resolved: **`@altafusion/fugue-nuxt-ui`** registers the unbranded Tailwind root; playground extends only `@altafusion/fugue-workflow` and needs no local CSS entry.
3. **`WorkflowWizardShell` layout** — Chrome (padding, shell slots) only renders when the shell gets a `layout` prop; product layouts often live in `@altafusion/shell`, so standalone apps need their own (playground: `app/layouts/default.vue`).
4. **Text + `validate:` focus loss** — Per-keystroke validation set `isBusy`, which disabled inputs and dropped focus; fixed with `isInputBusy` on fields.

## Known wizard chrome (not fixed here)

- Stepper “Step N of 5” in the footer is Reka’s screen-reader-only live region (`role="status"`, `opacity: 0`) — invisible to sighted users; off by one on every step (e.g. step 2 announces “Step 1 of 5” while bullets are correct). Upstream Nuxt UI 4.10.0 `Stepper.vue` passes 0-based `currentStepIndex` to Reka’s `StepperRoot`, which expects 1-based; no clean local fix via props, left as-is.
- Terminal steps with no inputs/actions no longer warn (`stepShouldWarnEmpty`); `footer.note` counts as body content.
