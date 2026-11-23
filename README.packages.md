# Shared packages

| Bucket | Role | Packages |
|--------|------|----------|
| **`packages-platform/`** | Platform toolchain and mock toolkit | `@altafusion/nuxt-base`, `@altafusion/eslint-config`, `@altafusion/test-kit`, `@altafusion/msw` |
| **`packages-fugue/`** | Cross-app reusables | `@altafusion/fugue-nuxt-ui`, `@altafusion/fugue-theme`, `@altafusion/fugue-ui`, `@altafusion/fugue-storage`, `@altafusion/fugue-devtools`, `@altafusion/fugue-simple-auth`, … |
| **`packages-product/`** | Product chrome | `@altafusion/shell` (+ future api-types, api-client) |
| **`packages-consumer/`** | Product / domain layers | `@altafusion/fugue-content` (+ future cms-admin, pickup, app adapters) |

## Dependency direction

```text
apps  →  packages-consumer  →  packages-product  →  packages-fugue  →  packages-platform
```

- **`packages-platform`** — no imports from product, fugue, or consumer buckets.
- **`packages-fugue`** — no imports from consumer or product; may use platform.
- **`packages-product`** — no imports from consumer; may use fugue and platform.
- **`packages-consumer`** — may use product, fugue, and platform; not imported by them.
- **`apps/`** (in your own repo) — thin composers; extend layers from consumer, product, fugue, and/or platform.

## Nuxt layers

Product apps that need **`@nuxt/eslint`** and theme tokens should **directly** extend **`@altafusion/fugue-theme`** (or a layer that extends it). Fugue Content uses **`defineFugueContentSite()`**, which wires **`fugue-theme`** + **`shell`**.

```ts
extends: ['@altafusion/fugue-theme', '@altafusion/shell']
```

**Docus + Studio** doc sites use **`templates/docus-site`** (default **Docus** theme, not **`fugue-theme`**). Optional read gate: **`@altafusion/fugue-simple-auth`** on the app (see **`packages-fugue/fugue-simple-auth/README.md`**).

## Workspace registration

Buckets are registered in `pnpm-workspace.yaml`:

```yaml
packages:
  - 'packages-platform/*'
  - 'packages-product/*'
  - 'packages-fugue/*'
  - 'packages-consumer/*'
  - 'templates/docus-site'
  - 'templates/fugue-content-site'
```

Internal packages are listed in the `internal` catalog in `pnpm-workspace.yaml` as a registry of workspace packages. Reference them with `workspace:*` in `package.json` (pnpm does not allow the workspace protocol inside catalog values).

## Adding a new package

1. Choose a bucket (`product`, `fugue`, or `consumer`) from the rules above.
2. `mkdir packages-<bucket>/my-package` and add `package.json` with `"name": "@altafusion/my-package"`.
3. For Nuxt layers, set `"main": "./nuxt.config.ts"`.
4. Add the name to the `internal` catalog in `pnpm-workspace.yaml` and declare `"@altafusion/my-package": "workspace:*"` in dependent `package.json` files.
5. Run `pnpm install` from the repo root.
