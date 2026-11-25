# Fugue Content Starter

Starter for **Fugue Content sites** on the product layer chain.

**Workspace package:** `@altafusion/fugue-content-site-template` at `templates/fugue-content-site/`.

**Architecture:** **[Fugue Content](/fugue-content)** in developer-docs · layer README: `packages-consumer/fugue-content/README.md`.

## Layer stack

```text
createAppConfig → app extends fugue-theme + shell + Fugue Content → app (content/, branding)
shell → fugue-ui → fugue-nuxt-ui → nuxt-base
fugue-theme → fugue-nuxt-ui → nuxt-base
```

## What this template owns

| Owns | From layers |
|------|-------------|
| `content/**` — sample markdown (`content/en/`, `content/es/` when i18n enabled) | `@altafusion/fugue-content` — Content module, MDC blocks, catch-all routes, optional i18n |
| `i18n/locales/*.yaml` — UI chrome strings | `@altafusion/shell` — header, footer, layouts, **`ShellLangToggle`** |
| `app/app.config.ts` — brand + Nuxt UI tokens | `@altafusion/shell` — header, footer, layouts |
| `app/assets/css/main.css` — Tailwind + Nuxt UI entry | `@altafusion/fugue-theme` — `@nuxt/ui`, base tokens |
| `nuxt.config.ts` — thin `defineFugueContentSite` entry | `@altafusion/nuxt-base` — shared app defaults, browser reuse |
| `site.config.ts` — theme, identity, content, Studio, dev sections | `@altafusion/fugue-content/site-config-registry` — `fugueContentStudioSection()` |

**Routing:** `@altafusion/fugue-content` ships `app/pages/index.vue` and `app/pages/[...slug].vue`. Add **`app/pages/**` in the app only** for interactive product routes that must win over content.

### Routing Precedence

| Route source | Example | Wins when |
|--------------|---------|-----------|
| **`app/pages/**`** (Vue) | `/app/demo` → `app/pages/app/demo.vue` | Explicit file exists — **always** over catch-all |
| **`content/**`** (markdown) | `/about` → `content/en/about.md` | No competing Vue page; served via `[...slug].vue` |

Nuxt resolves **more specific** **`app/pages/**`** files before the Fugue Content `[...slug].vue` catch-all.

### Studio Fragments in Vue Pages

Editorial sections inside product routes use **`content/{locale}/fragments/{slug}.md`** — a dedicated **`fragments_{locale}`** collection (not served by the catch-all). Embed with **`<FugueContentFragment slug="app-demo" />`** or **`useFugueContentFragment('app-demo')`** on **`/app/demo`**.

**Studio preview:** fragments are editable at **`/fragments/{slug}`** (and **`/es/fragments/{slug}`**) via **`app/pages/fragments/[slug].vue`** in `@altafusion/fugue-content` — avoids the pages catch-all “Page Not Found” when Studio opens a fragment.

Product routes use shell **`product`** layout (`definePageMeta({ layout: 'product' })`). This template overrides `app/layouts/product.vue` to keep site header + nav on product pages. Register nav with locale-neutral `to` in **`runtimeConfig.public.appNav`**; set **`nav.primary`** in page meta to highlight the active item.

Full guide: **`/fugue-content/extension-model`** in developer-docs.

## Theming

1. **`palette.ts`** — export **`sitePalette`** (generic name); set app-specific `id`, `theme`, and colors inside the object (see the example palette in the template).
2. **`site.config.ts`** → **`siteConfigTheme`** — `siteConfigThemeFromPalette(sitePalette)` loads app-local `~/assets/css/themes/{theme}-theme.css`.
3. **`app/assets/css/main.css`** — imports `@altafusion/fugue-theme/themes/tailwind.css` and `@altafusion/shell/themes/tailwind-shell.css`.
4. **`app/app.config.ts`** — `mirrorAppUiThemeFromPalette(sitePalette)` (no manual mirror of `primary` / `gray`); `header.visualStyle: 'default'` for this template.

**Dark canvas:** this template ships **`darkCanvas: 'black'`** in **`palette.ts`** and **`content/{locale}/settings/site.yml`** → `theme.darkCanvas`. Use `gray` for the default gray-900 stack. The **`@altafusion/fugue-theme`** dark-canvas plugin sets `html[data-dark-canvas]` at runtime.

### Header visual styles

| Style | When to use |
|-------|-------------|
| **`default`** | This template — multi-route CMS (`UHeader` + `appNav`) |
| **`landing-fixed`** | One-page brochure — hash nav, mobile drawer |
| **`landing-static`** | Landing chrome without fixed positioning |

```ts
// app/app.config.ts — brochure pilot example
header: {
  visualStyle: 'landing-fixed',
  showColorMode: true,
},
```

Chrome CSS loads from **`@altafusion/shell`** (`landing-header.css`, `shell-chrome.css`). Override menu weight/spacing via CSS vars on `.landing-header` in `main.css` or your token file.

## Branding and favicon

Apps with an **`app/`** directory must place **`app.config.ts` inside `app/`** (not the project root) so Nuxt merges brand and UI tokens.

| Need | Where |
|------|--------|
| Favicon file | `public/favicon.svg` (served at `/favicon.svg`) |
| Logo path + favicon | `app/app.config.ts` → `brand.logo`, `brand.favicon` (developer — guarded) |
| Header site name | **`content/{locale}/settings/site.yml`** → `siteName` (Studio); fallback `brand.name` |
| Explicit head link | `site.config.ts` → `siteConfigIdentity.app.head.link` (template includes this) |
| `/favicon.ico` requests | `server/routes/favicon.ico.ts` redirects to the SVG |

Use a filled SVG or explicit `fill` colors — thin `stroke="currentColor"` icons can look blank in browser tabs.

## Internationalization

This template ships **English** (`/`) and **Spanish** (`/es`) via **`site.config.ts`** → **`siteConfigContent.i18n`**:

| What | Where |
|------|--------|
| Editorial copy | **`content/en/**`**, **`content/es/**` |
| Nav structure (paths, keys) | **`site.config.ts`** → `siteConfigIdentity.runtimeConfig.public.appNav` |
| Nav + UI labels | **`i18n/locales/en.yaml`**, **`es.yaml`** (`nav.home`, `nav.about`, …) |
| Locale switcher | Shell **`ShellLangToggle`** |

Nav uses locale-neutral paths (`to: '/about'`); shell applies **`localePath()`** so Spanish stays on `/es/about`. Full reference: **`/fugue-content/starter-template/i18n`** in developer-docs.

## Site settings and SEO

| What | Where |
|------|--------|
| Site metadata (phone, address, SEO defaults) | **`content/{locale}/settings/site.yml`** — `settings_{locale}` data collection |
| Fallback SEO | **`app/app.config.ts`** → `seo` block (wired by `useFugueContentSiteSeo`) |
| Per-page meta | Content frontmatter `title` / `description` on pages and fragments |

Full guide — merge order, Studio paths, guarding: **[Settings & Metadata](/fugue-content/starter-template/settings-and-metadata)** in developer-docs.

`useFugueContentSettings()` and `useFugueContentSiteSeo()` live in `@altafusion/fugue-content`. Site-wide OG/Twitter tags apply via the `seo-defaults` plugin; content routes and Vue pages can pass overrides.

## Nuxt Studio

**`defineFugueContentSite()`** wires **`nuxt-studio`** with a git-backed **`pages`** collection. Default admin route: **`/_studio`**.

1. Copy **`.env.example`** → **`.env`** and set Studio OAuth vars (see **[Docus Studio requirements](/docs-site/setup/requirements)** — same module as doc sites).
2. **`studio.repository.rootDir`** must match this app’s path in the git repo (`templates/fugue-content-site` in the monorepo; `apps/<name>` after copy).
3. Install Studio **devDependencies**: `debug`, `extend`, `slugify` (already in this template).
4. Run **`pnpm dev`** → open **`http://localhost:8001/_studio`** (use **`localhost`**, not `127.0.0.1`, for Google OAuth).

**Publish** commits markdown under `content/` with prefix `content(fugue-content-site):` (configurable in **`siteConfigStudio`**). Production publish needs **`STUDIO_GITHUB_TOKEN`** on the server host.

## Deploy Readiness and Template Sync

**This template** must stay aligned on the **common deploy baseline** (auth, Studio, SSR, env docs) before other apps copy from here.

| Doc | Use |
|-----|-----|
| **[Pilot deploy checklist](/fugue-content/starter-template/pilot-deploy-checklist)** | Phases 3–5 — Netlify, OAuth, editor smoke test |
| **[Template sync baseline](/fugue-content/starter-template/pilot-deploy-checklist#template-sync-baseline)** | Pilot ↔ template checklist — **one exit gate** with production deploy |
| **[Priority Compass — Now](/priority-compass/now)** | Thread **F** is done. **Next** is thread **C** — review this template, then copy it to new sites |

When a pilot site proves a baseline row (e.g. **`netlify.toml`**, **`fugueContentAuthModeSection('studio')`**), backport it here in the **same arc** — do not defer template sync past deploy exit. Site-specific only: `rootDir`, port, branding, content, Netlify hostname, secret **values**.

## Netlify (template deploy)

**Checklist:** developer-docs **[Pilot deploy checklist](/fugue-content/starter-template/pilot-deploy-checklist)** — Phases 3–5 (site creation, Google OAuth, editor smoke test).

| Setting | Value |
|---------|--------|
| **Base directory** | *(empty — repository root)* |
| **Configuration file** | `templates/fugue-content-site/netlify.toml` *(if UI offers it)* |
| **Package directory** | `templates/fugue-content-site` *(monorepo UI — optional if config file is set)* |
| **Publish** | `templates/fugue-content-site/dist` (from `netlify.toml` — SSR requires `SITE_AUTH_ENABLED=true` at build) |

**Env (summary)** — generic **`SITE_*`** names; see **[Environment convention](/fugue-content/starter-template/pilot-deploy-checklist#environment-convention)**:

| Variable | Scope |
|----------|--------|
| `SITE_AUTH_ENABLED` | **Builds** — `true` (in `netlify.toml`) |
| `STUDIO_GOOGLE_*` | **Functions** — Google OAuth — **[setup guide](/fugue-content/starter-template/studio-access-setup#configure-google-oauth)** |
| `STUDIO_GITHUB_TOKEN` | **Functions** — publish PAT on `altafusion-monorepo` |

**Auth mode:** **`fugueContentAuthModeSection('studio')`** — see **[Auth Mode](/fugue-content/starter-template/studio-access-setup#auth-mode-site-manifest)**.

Copy **`.env.example`** → **`.env`** for local dev (`SITE_DEV_PORT`). **Google OAuth setup:** **[Studio access & setup — Configure Google OAuth](/fugue-content/starter-template/studio-access-setup#configure-google-oauth)**.

**Local reset** (stale auth, cache, or Nuxt types): stop dev, then `pnpm reset:fugue-content-site` from repo root (or `pnpm reset` in this folder). Does **not** clear browser cookies (auth **`Fugue Content-auth`**). Stale auth cookies are cleared automatically on load when the session is invalid.

**Editing:** **`/login`** is the editor entry (Google OAuth in production; **`/login`** or **⌘.** locally). **`authMode: 'studio'`** means no public **Edit** for anonymous visitors, and peek **`SITE_ACCESS_KEY`** is not used.

## Use in this monorepo

1. Copy this folder to `apps/<name>/` (rename the package in `package.json`).
2. Add a dev port in `packages-platform/nuxt-base/dev/ports.ts` and root `pnpm dev:<name>`.
3. Replace sample `content/` and adjust `runtimeConfig.public.appNav`.

**Smoke test:** `pnpm dev:fugue-content-site` or `pnpm --filter @altafusion/fugue-content-site-template build`.

## Local dev (`scripts/dev.mjs`)

**`pnpm dev`** runs **`scripts/dev.mjs`**, not bare **`nuxt dev`**. On **macOS**, Nuxt 4.4+ vite-node IPC sockets under **`$TMPDIR`** can exceed the Unix socket path limit → **`connect EINVAL …nuxt-vite-node….sock`**. The script sets **`TMPDIR=/tmp`** when needed.

The script sets **`NUXT_DEV_EAGER_LISTEN=0`** so the server binds after Nuxt config loads. Until the app is ready, the browser shows **`app/spa-loading-template.html`** (the same boot splash as developer-docs) instead of the Nuxt 4.6 logo.

Set **`SITE_DEV_PORT`** / **`PORT`** in **`.env`** (default **8001** — see **`templateDevPorts`** in **`@altafusion/nuxt-base/dev/ports`**). Studio vars: **`STUDIO_GOOGLE_*`**, **`STUDIO_GITHUB_TOKEN`**, **`SITE_AUTH_ENABLED`** — see **[Environment convention](/fugue-content/starter-template/pilot-deploy-checklist#environment-convention)** and **[Auth Mode](/fugue-content/starter-template/studio-access-setup#auth-mode-site-manifest)**.

Root **`pnpm-workspace.yaml`** must set **`nodeLinker: hoisted`** for Content SQLite (same as `developer-docs`).

## Agent Rules

`.cursor/rules/` holds the code rules a new site starts with:

| Rule | Says |
|------|------|
| `nuxt-ui-first.mdc` | Use native Nuxt UI components and conventions before building custom ones |
| `vue-tailwind-classes.mdc` | Style with Tailwind classes and semantic tokens, never scoped CSS |
| `vue-props-destructure.mdc` | Declare props by destructuring `defineProps` with inline defaults, no `withDefaults` |
| `nuxt-omit-autoimports.mdc` | Do not import what Nuxt already auto-imports |

Cursor loads them natively and `CLAUDE.md` imports them for Claude Code. Edit or add rules there; keep `CLAUDE.md` for what is
specific to your site.

## Related

| Template / package | Use |
|--------------------|-----|
| **`templates/docus-site`** | Gated or public **documentation** (Docus + Studio) |
| **`@altafusion/fugue-content`** | Content engine, layouts, MDC blocks |
| **`@altafusion/shell`** | Site chrome |

Do not use Docus for consumer marketing sites — see **[Options analysis](/fugue-content/options-analysis)**.
