# packages-consumer

Product **domain** Nuxt layers — Fugue Content and app-specific adapters.

Examples: **`@altafusion/fugue-content`**, **`@altafusion/cms-admin`** (future), per-app theme or nav adapters.

Current:
- **`fugue-content/`** — Nuxt Content layer: `pages` collection, content catch-all, `landing` / `article` layouts, shared MDC (`Hero`, `CallToAction`). Extends **`@altafusion/shell`** (`packages-product/shell`). Blueprint: developer-docs **`/fugue-content`**. Starter: **`templates/fugue-content-site/`**.

Site chrome **`@altafusion/shell`** lives in **`packages-product/`**. The MSW toolkit **`@altafusion/msw`** lives in **`packages-platform/`**.

**Dependency rule:** may depend on `packages-product/*`, `packages-fugue/*`, and `packages-platform/*`; must not be imported by those buckets.

See [README.packages.md](../README.packages.md) for the full bucket layout.
