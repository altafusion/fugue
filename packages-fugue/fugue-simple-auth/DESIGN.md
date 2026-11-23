# @altafusion/fugue-simple-auth — design

Access-key gate for Nuxt apps: optional soft auth via env var, signed session cookie, SSR-safe Netlify deploy.

## Bucket

`packages-fugue/` — cross-app reusable (same tier as `fugue-storage`, `fugue-devtools`).

## UI

Registers **`@nuxt/ui`** for the default login form. Does **not** extend **`@altafusion/fugue-theme`** — portable for **docus-site template** (Docus theme) and product apps that already extend **`shell`** (and usually **`fugue-theme`** at the app root for tokens).

Not `packages-platform` bucket-only (platform infra) or `packages-consumer` (future `@altafusion/auth` = OAuth/sessions).

## Gate modes

| Mode | Use case | Behavior |
|------|----------|----------|
| **`full`** | Private docs | All routes gated except login, auth API, assets |
| **`routes`** | Public landing + secure area (organizer area) | Only `protectedRoutes` gated; `/` stays public |

## Configuration

Apps extend the layer and set `runtimeConfig.public.fugueSimpleAuth`:

```ts
runtimeConfig: {
  public: {
    fugueSimpleAuth: {
      envPrefix: 'MY_SITE',
      cookieName: 'my-site-auth',
      sessionLabel: 'my-site-authenticated',
      mode: 'full',
      loginDescription: 'Enter the access key to view this documentation.',
    },
  },
},
```

### Environment variables (per app)

Derived from `envPrefix`:

| Variable | Purpose |
|----------|---------|
| `{PREFIX}_ACCESS_KEY` | Secret — **Functions** scope on Netlify; never inlined at build |
| `{PREFIX}_AUTH_ENABLED` | `true` on **Builds** scope to enable SSR preset without the secret |

## Security

- Access key is read at **runtime** only (`process.env` with dynamic key name).
- Never assign the key into `runtimeConfig` at build time (Netlify secret scan).
- Session cookie = HMAC-SHA256 of `sessionLabel` keyed by access key.

## Phasing

| Phase | Status |
|-------|--------|
| 0–2 | Package + auth engine |
| 3 | Nuxt layer (middleware, routes, login, build hooks) |
| 5 | docs-site migration (`full` mode) — done |
| 6 | landing-site pilot (`routes` mode, `/organizer/**`) — done |
| 7 | developer-docs page — done |

## Overrides

Apps may replace `app/pages/login.vue` for branding. Auth API paths are fixed at `/api/auth/*` for v1.
