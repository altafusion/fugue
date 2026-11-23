# @altafusion/fugue-content

Nuxt layer for **Fugue Content sites** — Nuxt Content, MDC blocks, and content routing. Composes with **`@altafusion/shell`** (site chrome stays in shell).

Blueprint: developer-docs **`/fugue-content`**. Starter app: **`templates/fugue-content-site/`**.

## Layer stack

```text
app extends @altafusion/fugue-theme + @altafusion/shell (+ @altafusion/fugue-content, …)
shell → fugue-ui → fugue-nuxt-ui → nuxt-base
fugue-theme → fugue-nuxt-ui → nuxt-base
@altafusion/fugue-content → shell → app
```

## Setup

Use **`defineFugueContentSite()`** so the consumer stack, Studio, and `createAppConfig` merge in one place.

**Config registry (recommended):** keep **`site.config.ts`** as the alias-style registry (named sections + combined export). **`nuxt.config.ts`** stays a thin entry:

```ts
// nuxt.config.ts
import { defineFugueContentSite } from '@altafusion/fugue-content/define-site'
import { siteConfig, siteConfigTheme } from './site.config'

export default defineNuxtConfig(defineFugueContentSite(siteConfig, siteConfigTheme))
```

```ts
// site.config.ts — section order: theme → identity → content → studio → dev
import { fugueContentStudioSection } from '@altafusion/fugue-content/site-config-registry'
import { siteConfigThemeFromPalette } from '@altafusion/nuxt-base/ui-theme'
import { sitePalette } from './palette'

export const siteConfigTheme = siteConfigThemeFromPalette(sitePalette)

export const siteConfigIdentity = {
  runtimeConfig: { public: { appName: 'My Site', appNav: [/* … */] } },
  app: { head: { link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }] } },
  css: ['~/assets/css/main.css'],
}

export const siteConfigContent = {
  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English', file: 'en.yaml', isCatchallLocale: true },
      { code: 'es', name: 'Español', file: 'es.yaml' },
    ],
  },
}

export const siteConfigStudio = fugueContentStudioSection({
  rootDir: 'apps/my-site',
  messagePrefix: 'content(my-site):',
})

export const siteConfigDev = { /* devServer, vite — see templates/fugue-content-site */ }

export const siteConfig = {
  ...siteConfigIdentity,
  ...siteConfigContent,
  ...siteConfigStudio,
  ...siteConfigDev,
}
```

**Shared builder:** **`fugueContentStudioSection()`** from **`@altafusion/fugue-content/site-config-registry`** — standard monorepo Studio block (`owner`, `repo`, `rootDir`, commit prefix).

**Theming:** export **`sitePalette`** from **`palette.ts`**; wire with **`siteConfigThemeFromPalette`** and **`mirrorAppUiThemeFromPalette`** — see **`templates/fugue-content-site/palette.ts`** and **[Theming](/fugue-content/theming#named-palette-collections)** in developer-docs.

Reference implementation: **`templates/fugue-content-site/site.config.ts`** + **`templates/fugue-content-site/palette.ts`**.

Or extend the layer manually with `createAppConfig` — see **`templates/fugue-content-site/nuxt.config.ts`**.

**Styling:** `@altafusion/fugue-theme` must be a **direct** `extends` entry (same as `templates/fugue-content-site`). That registers `@nuxt/ui`, theme CSS, and Tailwind. MDC blocks in this layer use **`UButton`** and semantic utilities (`text-highlighted`, `text-muted`) — not bespoke scoped CSS.

**Dependencies** (app or template `package.json`):

```json
{
  "dependencies": {
    "@altafusion/fugue-theme": "workspace:*",
    "@altafusion/shell": "workspace:*",
    "@altafusion/fugue-content": "workspace:*",
    "better-sqlite3": "catalog:content"
  },
  "devDependencies": {
    "debug": "catalog:utils",
    "extend": "catalog:utils",
    "slugify": "catalog:utils"
  }
}
```

Root **`pnpm-workspace.yaml`** must set **`nodeLinker: hoisted`** for Content SQLite (same as `developer-docs`).

## Routing

Content routes ship in **`@altafusion/fugue-content`** (`app/pages/index.vue`, `app/pages/[...slug].vue`). Apps add **`pages/**` only** for interactive product routes that must override content paths.

Logic lives in **`useFugueContentCatchAllRoute()`**, **`FugueContentContentPage`**, **`FugueContent404Page`**, and **`FugueContentLayout*`** components.

Missing content paths render **`FugueContent404Page`** (404 status + generic copy). Override in the consumer app with **`app/components/FugueContent404Page.vue`** — same component name, optional props (`title`, `description`, `actionLabel`, `actionTo`).

Add markdown under the app **`content/`** directory.

**Monolingual** (default):

```text
content/
  index.md          → /
  about.md          → /about
```

**Multilingual** — set `i18n.locales` in `defineFugueContentSite()` and use locale folders (see **`templates/fugue-content-site`**):

```text
content/
  en/
    index.md        → /
    about.md        → /about
  es/
    index.md        → /es
    about.md        → /es/about
```

UI chrome strings live in **`i18n/locales/*.yaml`** (not in markdown). Full design: developer-docs **`/fugue-content/starter-template/i18n`**.

### Fragments (embed in Vue pages)

Studio-editable sections inside product routes — not served by the catch-all:

```text
content/en/fragments/app-demo.md   →  fragments_en collection
app/pages/app/demo.vue             →  <FugueContentFragment slug="app-demo" />
/fragments/app-demo                →  Studio preview route (pages/fragments/[slug].vue)
```

| Piece | Role |
|-------|------|
| **`fragments` / `fragments_{locale}`** | Markdown under `content/{locale}/fragments/`; excluded from `pages_*` |
| **`useFugueContentFragment(slug)`** | Loads fragment by file stem for the active locale |
| **`FugueContentFragment`** | `ContentRenderer` wrapper with loading / error states |

## Site settings and SEO

Locale-aware site metadata — **`siteName`** (header title), phone, address, hours, social links, default OG — lives in a **`settings_{locale}`** data collection (not routed). **Developer-docs:** **[Settings & Metadata](/fugue-content/starter-template/settings-and-metadata)**.

```text
content/en/settings/site.yml   →  settings_en collection
content/es/settings/site.yml   →  settings_es collection
```

IDE validation: `packages-consumer/fugue-content/schemas/site-settings.schema.json` (wired in workspace `.vscode/settings.json`). Add the modeline at the top of `site.yml` when editing outside this repo layout.

| Piece | Role |
|-------|------|
| **`settings` / `settings_{locale}`** | YAML under `content/{locale}/settings/`; Studio-editable |
| **`useFugueContentSettings()`** | Loads active locale settings document |
| **`landing.sections` in settings** | One-page manifest — order, anchors, `component`, optional `nav` |
| **`FugueContentLandingPage`** | Renders manifest sections with dynamic components (default `FugueContentFragment`) |
| **`useFugueContentLanding()`** | Computed sections from `settings.landing` |
| **`landing-nav` plugin** | Registers shell nav from sections that define `nav` |
| **`shell-display-name` plugin** | Header title from `settings.siteName` (logo in `app.config` `brand`) |
| **`useFugueContentSiteSeo(overrides?)`** | Merges settings `seo`, `app.config` `seo`, and per-page title/description; sets OG/Twitter meta |
| **`seo-defaults` plugin** | Applies site-wide SEO defaults on every route |

Per-page meta still comes from content frontmatter (`title`, `description`) or explicit `useFugueContentSiteSeo()` on Vue routes. Fallbacks: **`app/app.config.ts`** → `seo` block.

**One-page landings** — `landing.sections` in `site.yml`:

```yaml
landing:
  sections:
    - slug: hero
      anchor: home
      component: FugueContentFragment
      nav: { labelKey: nav.home, label: Home, icon: i-lucide-home, id: home }
    - slug: activities
      anchor: activities
      component: FugueContentFragment
      variant: alt
    - slug: hero
      anchor: home
      sectionClass: landing-hero
      component:
        name: LandingHeroMedia
        props:
          src: /assets/img/hero.jpg
          alt: Example hero
          slug: hero
```

**`component`** — string shorthand (`FugueContentFragment`) or an object with **`name`** and nested **`props`**. Keep props under the component they configure; do not use a sibling top-level `props` key on the section row.

**`LandingHeroMedia`** — responsive bookend hero shell (image above on mobile, content, image below on desktop). Pass `src` and `alt` in `component.props`. Slot content: `slug` (defaults to the section `slug` for `FugueContentFragment`) or `contentComponent` for an app hero (e.g. `MyHero`).

Per-section `sectionClass` overrides the page-level `section-class` on `<FugueContentLandingPage />` for that row only. `variant` still appends `{sectionClass}--{variant}` using the resolved base class.

Vue route: `<FugueContentLandingPage section-class="my-section" />`. Add a section by creating `fragments/{slug}.md` and a new manifest row — no `index.vue` edit.

**Custom landing components** (e.g. `MyHero` instead of `FugueContentFragment`) — list the PascalCase name in `landing.sections[].component`. The **`fugue-content-landing-components`** module scans `site.yml` and registers those app components globally so SSR includes them for dynamic `:is`. Override or extend with the **`components`** prop on `FugueContentLandingPage` when needed.

## Internationalization

When the app passes **`i18n.locales`** to **`defineFugueContentSite()`**:

| Piece | Role |
|-------|------|
| **`modules/i18n`** | Registers `@nuxtjs/i18n` when locales are configured |
| **`content.config.ts`** | Builds **`pages_en`**, **`pages_es`**, **`fragments_*`**, **`settings_*`**, … per locale folder |
| **`useFugueContentI18n()`** | Locale + pages/fragments/settings collection names |
| **`useFugueContentCatchAllRoute()`** | Queries the active locale’s collection |
| **`useFugueContentI18n().localePath()`** | Resolves MDC / in-content links (`CallToAction`, `Hero`) |
| **`FugueContent404Page`** | **`useShellI18n().t()`** for copy (`fugueContent404.*` keys); **`localePath('/')`** for home link |
| **`@altafusion/shell`** | **`ShellLangToggle`**, **`useShellI18n`**, **`useAppNav`** (`labelKey` + `localePath`) |

Defaults merged by **`defineFugueContentSite()`**: `strategy: 'prefix_except_default'`, `langDir: 'locales'` (files in `i18n/locales/`), **`detectBrowserLanguage: false`** ( **`/`** stays default locale until the user opens **`/es`** or the header language link). Omit **`i18n`** for single-locale apps — flat **`pages`** collection unchanged.

### Header nav (multilingual)

| File | Role |
|------|------|
| App **`site.config.ts`** → `appNav` | Locale-neutral **`to`**, **`labelKey`**, **`id`**, icon |
| App **`i18n/locales/*.yaml`** | **`nav.*`** nav labels; **`fugueContent404.*`** 404 page copy (English fallbacks in layer when keys are absent) |

See developer-docs **`/fugue-content/starter-template/i18n`** for full examples.


### Frontmatter

```yaml
---
title: About us
description: Short summary for SEO
layout: landing   # landing | article | article-aside (default: landing)
nav:
  primary: about  # matches shell header active id
---
```

Long-form pages: **`layout: article`** (prose + per-page **Edit**) or **`layout: article-aside`** (+ **On This Page** TOC from markdown headings). See developer-docs **[Article Layouts](/fugue-content/starter-template/article-layouts)**.

## MDC blocks

Shared marketing blocks live in `app/components/content/`. Apps override by the **same component name** only when branding or layout requires it — not by default.

### Naming

| Audience | Convention |
|----------|------------|
| **Editors (Studio)** | Pick blocks from the `/` menu; prop labels should read plainly (`label`, `to`, `actionLabel`) |
| **Shared blocks (Fugue Content)** | Plain PascalCase — `Hero`, `CallToAction`, `FeatureGrid` — no `FugueContent` prefix |
| **Package internals** | `FugueContent*` prefix — `useFugueContentI18n`, `FugueContentContentPage`, `defineFugueContentSite` |
| **App-only blocks** | Site-specific names — `OverrideDemo`, `EnrollmentForm` |
| **Dev shorthand** | Optional `mdc.components.map` alias — e.g. `cta` → `CallToAction` |

| Component | MDC tag | Props |
|-----------|---------|-------|
| `Hero` | `::hero` | `title`, `description`, `actionLabel`, `actionTo` (locale-neutral; resolved at render) |
| `CallToAction` | `::call-to-action` (alias `:cta`) | `label`, `to`, `variant` (locale-neutral `to`) |

Example:

```md
::hero
---
title: Welcome
description: Fugue Content Starter
actionLabel: Learn more
actionTo: /about
---
::
```

## Studio

**`nuxt-studio`** is registered in this layer. Apps enable editing via **`defineFugueContentSite({ studio: { … } })`** (see **`templates/fugue-content-site`**).

| Piece | Role |
|-------|------|
| **Layer** | `modules: ['@nuxt/content', 'nuxt-studio']` |
| **App config** | `studio.repository` — `owner`, `repo`, `branch`, optional `rootDir` for monorepo apps |
| **Env vars** | `STUDIO_GOOGLE_*` or `STUDIO_GITHUB_*`, `STUDIO_GITHUB_TOKEN` for publish — see **[Docus Studio requirements](/docs-site/setup/requirements)** (same module) |
| **Dev deps** | `debug`, `extend`, `slugify` in the app `package.json` |

Open **`/_studio`** in dev after setting OAuth env vars. Production editing requires **`nuxt build` + Netlify SSR** (not static/`nuxt generate` alone). Editors sign in at **`/login`** — Google OAuth in production; dev establishes a local session and redirects back.

**Auth mode:** Default pilots set **`fugueContentAuthModeSection('studio')`** in **`site.config.ts`** — Google OAuth only. Optional peek gate: **`authMode: 'peek'`** + **`fugueContentAuthSection()`** — see **[Auth Mode](/fugue-content/starter-template/studio-access-setup#auth-mode-site-manifest)**.

**Deploy checklist:** developer-docs **[Pilot deploy checklist](/fugue-content/starter-template/pilot-deploy-checklist)** — applies to all Fugue Content pilots.

### Auth Mode (`site.config.ts`)

| `authMode` | Manifest | Peek (`SITE_ACCESS_KEY`) | Production editing |
|------------|----------|--------------------------|-------------------|
| **`studio`** | **`fugueContentAuthModeSection('studio')`** | Off — env ignored | **`/login`** → Google OAuth → avatar menu |
| **`peek`** | **`authMode: 'peek'`** + **`fugueContentAuthSection()`** | **`/login`** access key | Peek → **`/login`** / Google → avatar menu |
| **`auto`** | Omit or peek helper | Studio env wins when both set | See **[Auth Mode](/fugue-content/starter-template/studio-access-setup#auth-mode-site-manifest)** |

**`defineFugueContentSite()`** resolves mode at build → **`runtimeConfig.public.fugueContent.authMode`**. fugue-simple-auth loads **only** when mode is **`peek`**.

### Optional Peek Gate (`authMode: 'peek'`)

For pre-launch or staging, add **`fugueContentAuthSection()`** with **`authMode: 'peek'`** and set **`SITE_ACCESS_KEY`** on Netlify **Functions**. **`routes`** peek scope keeps the brochure public; **`full`** locks the whole site.

```ts
export const siteConfigAuth = {
  authMode: 'peek' as const,
  ...fugueContentAuthSection({
    cookieSlug: 'my-app',
    loginDescription: 'Enter the access key to open the content editor.',
  }),
}
```

| Piece | Role |
|-------|------|
| **`resolveFugueContentSiteAuth()`** | Manifest + env hierarchy |
| **`defineFugueContentSite({ auth, studio, authMode })`** | Extends fugue-simple-auth only for **`peek`** |
| **`useFugueContentAuthMode()`** | Runtime **`hasPeekGate`**, **`authMode`** |
| **`useFugueContentStudioSession()`** | Studio Google/dev session + avatar user |
| **`/login`** | Unified editor entry (OAuth or peek access key) |
| **`FugueContentEditorMenu`** + **`useFugueContentStudioEditorEntry`** | Avatar menu — **Edit content**, **Sign Out** |
| **Env vars** | **`STUDIO_GOOGLE_*`** (Functions); **`SITE_ACCESS_KEY`** only for peek — see **[Site env vars](/monorepo/development/site-env-vars)** |

Feature walkthrough: **[Auth Mode](/fugue-content/starter-template/studio-access-setup#auth-mode-site-manifest)** · **[Configure Google OAuth](/fugue-content/starter-template/studio-access-setup#configure-google-oauth)** · **[User Content Workflows](/fugue-content/starter-template/user-content-workflows)** · **[Studio Module](https://nuxt.studio/setup)** on developer-docs.

**Upstream fixes:** validate a local nuxt-studio checkout before catalog bumps (`pnpm link:nuxt-studio` / `pnpm unlink:nuxt-studio`).

### qeTools (operator console)

Every Fugue Content app registers **`window.qeTools`** in the browser (dev and production). **Console-only** — there is no on-page panel. **`studioDrafts`** targets **production** IndexedDB drafts (Netlify); **local dev** writes to disk — use **`git restore`** instead.

Open **DevTools → Console**, then:

```text
qeTools.help()
await qeTools.studioDrafts.list()
```

Optional discovery: add **`?qetools`** to the URL — help text prints to the console on load (still requires DevTools open).

Import in code: **`@altafusion/fugue-content/qe-tools`** or **`@altafusion/fugue-content/qe-tools/studio-drafts`**.

Developer-docs: **[User Content Workflows — qeTools](/fugue-content/starter-template/user-content-workflows#qetools-operator-console)** · **[User Guide — Undo and Recover](/fugue-content/user-guide/undo-and-recover)** · **[Priority Compass — Editing Pilot](/priority-compass/now)**.

## Related

- **`@altafusion/shell`** — headers, footers, `useAppNav`
- **`templates/fugue-content-site`** — copy to `apps/<name>` when scaffolding a site
