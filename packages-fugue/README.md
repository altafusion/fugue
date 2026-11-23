# packages-fugue

Cross-app reusable packages — generic UI, utilities, and tooling that **consumer layers and product apps** can both use. Not domain- or product-specific.

| Package | Description |
|---------|-------------|
| **`fugue-nuxt-ui/`** | `@altafusion/fugue-nuxt-ui` — unbranded `@nuxt/ui` + `@nuxt/eslint` base |
| **`fugue-theme/`** | `@altafusion/fugue-theme` — optional tokens, theme CSS, Tailwind entry |
| **`fugue-ui/`** | `@altafusion/fugue-ui` — generic Vue primitives (`CopyToClipboard`, `TileSelector`, …) |
| **`fugue-workflow/`** | `@altafusion/fugue-workflow` — workflow orchestrator layer (+ `playground/`) |
| **`fugue-devtools/`** | `@altafusion/fugue-devtools` — non-modal dev tools drawer |
| **`fugue-devtools-persist/`** | `@altafusion/fugue-devtools-persist` — persist helpers (uses `@altafusion/fugue-storage`) |
| **`fugue-simple-auth/`** | `@altafusion/fugue-simple-auth` — access-key gate (Altafusion-only) |
| **`fugue-storage/`** | `@altafusion/fugue-storage` — namespaced localStorage (VueUse-backed) |

Examples (future): shared composables, product adapters in `packages-consumer/`.

**Dependency rule:** may depend on `packages-platform/*`. Must not depend on `packages-product/*` or `packages-consumer/*`.

See [README.packages.md](../README.packages.md) for the full bucket layout.
