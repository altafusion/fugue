# @altafusion/fugue-simple-auth

Optional **access-key gate** for Nuxt apps: env-driven secret, signed session cookie, SSR-safe Netlify deploy.

Design notes: **`DESIGN.md`**.

## UI dependency

The default login page uses **Nuxt UI** (`UButton`, `UInput`, `UCard`, …). This layer registers **`@nuxt/ui`** and does **not** extend **`@altafusion/fugue-theme`**.

| Context | Who provides `@nuxt/ui` |
|---------|-------------------------|
| Doc sites extending **`docus`** (+ optional this layer) | **`docus`** (and this layer — deduped) |
| Product apps extending **`shell`** / **`fugue-ui`** | **`fugue-nuxt-ui`** (often plus **`fugue-theme`** for tokens) |
| **Standalone** extend of this layer only | Add **`@nuxt/ui`** to the app or extend a layer that registers it |

Override **`app/pages/login.vue`** or slot **`SimpleAuthLoginForm`** for custom branding without pulling Altafusion theme CSS.

## Quick start

```ts
// apps/my-app/nuxt.config.ts
export default defineNuxtConfig({
  extends: ['@altafusion/fugue-simple-auth'],
  runtimeConfig: {
    public: {
      fugueSimpleAuth: {
        envPrefix: 'MY_APP',
        cookieName: 'my-app-auth',
        sessionLabel: 'my-app-authenticated',
        mode: 'full',
        loginDescription: 'Enter the access key to continue.',
      },
    },
  },
})
```

```bash
# .env
MY_APP_ACCESS_KEY=your-secret-key
```

## Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `envPrefix` | `APP` | Env var prefix → `{PREFIX}_ACCESS_KEY`, `{PREFIX}_AUTH_ENABLED` |
| `cookieName` | `fugue-simple-auth` | HttpOnly session cookie name |
| `sessionLabel` | `fugue-simple-authenticated` | HMAC payload — unique per app |
| `mode` | `full` | `full` (whole site) or `routes` (only `protectedRoutes`) |
| `loginPath` | `/login` | Login page route |
| `apiPrefix` | `/api/auth` | Auth API base path |
| `protectedRoutes` | `[]` | Used in `routes` mode (e.g. `['/team/**']`) |
| `loginDescription` | generic copy | Subtitle on the default login page |

## Environment variables

From `envPrefix` (e.g. `MY_SITE`):

| Variable | Purpose |
|----------|---------|
| `{PREFIX}_ACCESS_KEY` | Secret — runtime only; never inlined at build |
| `{PREFIX}_AUTH_ENABLED` | `true` on Netlify **Builds** to enable SSR preset without the secret |

## Gate modes

| Mode | Behavior |
|------|----------|
| `full` | Gate all routes except login, auth API, assets |
| `routes` | Public site; only `protectedRoutes` gated (e.g. `/organizer/**`) |

## Netlify (quick)

When `{PREFIX}_AUTH_ENABLED=true` **or** `{PREFIX}_ACCESS_KEY` is set at **build** time, the layer automatically:

- Sets Nitro preset to **`netlify`** (SSR)
- Sets **`experimental.externalVue: false`** and merges **`vue`** / **`@vue/server-renderer`** into Nitro **`externals.inline`** (avoids missing `vue/server-renderer` on Netlify — [nuxt#30224](https://github.com/nuxt/nuxt/issues/30224))
- Prerenders **`/login`**
- Writes SSR **`_redirects`** (`/* → /.netlify/functions/server`)

**Recommended env split** (keeps the secret off the build image):

| Variable | Scope | Value |
|----------|--------|--------|
| `{PREFIX}_AUTH_ENABLED` | **Builds** | `true` |
| `{PREFIX}_ACCESS_KEY` | **Functions** | your secret |

**Monorepo:** each app still needs its own `netlify.toml`, publish path, and (for SSR) correct **Package directory** in the Netlify UI.

**Secret scan:** the access key is never copied into `runtimeConfig` or client bundles — safe to deploy with Netlify’s post-build scanner when env is scoped as above.

## Overrides

Replace `app/pages/login.vue` in your app for custom branding, or embed **`SimpleAuthLoginForm`** on a public page.

### Composable and form

| Export | Purpose |
|--------|---------|
| **`useSimpleAuthLogin()`** | Access key state, submit handler, redirect resolution |
| **`useSimpleAuthSession()`** | `{ authenticated, required }` from `/api/auth/session` |
| **`useAppBrand()`** | `{ name, logo, logoAlt }` from `app.config.brand` |
| **`<SimpleAuthLoginForm>`** | Headless form with `#logo`, `#header`, `#field`, `#error`, `#submit`, `#footer` slots |

Props include **`title`**, **`description`**, **`logoSrc`**, **`logoAlt`**, **`logoSize`**, **`logoClass`**, **`redirectTo`**, and button copy. When **`logoSrc`** is unset, the form uses **`app.config.brand.logo`**. **`logoClass`** defaults to **`app.config.brand.logoClass`** (e.g. `dark:brightness-0 dark:invert` for SVGs that use `currentColor`). **`loginDescription`** from config is the default description.

Auth API paths are `/api/auth/*` in v1.

## Consumers

> **Local — do not copy-sync.** Repo wiring, ports, catalog keys, consuming apps, and docs-site links.

- Consuming apps extend this layer either with **`docus`** (`full` mode) or directly (`routes` mode). A public docs site needs no read gate.
