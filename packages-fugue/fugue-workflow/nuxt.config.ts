/**
 * @altafusion/fugue-workflow — Nuxt layer
 *
 * Domain-free Workflow Orchestrator engine (schema, loader, resolvers, guard DSL,
 * composables `useWorkflow` / `useWorkflowContext`) and generic wizard UI.
 * Consumers import the public API via the `#orchestrator` alias.
 */
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  extends: ['@altafusion/fugue-ui'],
  // Pinia store in the engine requires `@pinia/nuxt`; the layer must register it, not assume a consumer did.
  modules: ['@pinia/nuxt'],
  alias: {
    '#orchestrator': fileURLToPath(new URL('./app/orchestrator.ts', import.meta.url)),
  },
  css: [
    fileURLToPath(new URL('./assets/css/wizard-tokens.css', import.meta.url)),
  ],
})
