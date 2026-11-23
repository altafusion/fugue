# @altafusion/shell

Nuxt layer: **site chrome** and **product page chrome** for consumer apps.

## Layouts

| Layout | Use |
|--------|-----|
| `default` | Nuxt UI site header, padded main, optional footer |
| `fullscreen` | Site header + full-bleed main (landing pages) |
| `minimal` | Full-viewport pass-through — auth flows, embeds |
| `product` | Nuxt UI `UPage` shell — optional aside + header slots, main body (dashboard-style apps) |

Pages: `definePageMeta({ layout: 'product' })`. Named slots (`#aside`, `#header`) via `<NuxtLayout>` when needed. `#header` renders in `UPage`'s default slot (before `UPageBody`), not as a `UPage` named slot.

## Composables

| Composable | Role |
|------------|------|
| **`usePageChrome()`** | `title`, `breadcrumbs`, `showAside` from route meta |
| **`useAppNav()`** | Primary header nav — `localePath` on `to`, optional `labelKey` for i18n labels |
| **`useShellI18n()`** | `localePath()` / `t()` when `@altafusion/fugue-content` enables i18n (`runtimeConfig.public.cms.i18nEnabled`) |
| **`setAppNavItems()`** | Register nav items for the app session |
| **`useShellChrome()`** | `showHeader`, `showFooter`, `mainPadding` from route meta + layout |
| **`useShellSiteHeader()`** | Shared wiring for **`ShellSiteHeader`** — title, **`brand`**, nav, **`visualStyle`**, color mode |
| **`useBrandTheme()`** | Cookie-backed runtime brand (`default` / `violet` / `green`) + `[data-brand]` |
| **`ShellBrandLogo`** | Renders **`app.config.brand.logo`** in headers and login forms |
| **`setShellHeaderActions()` / `useShellHeaderActions()`** | Register header actions from a page (`onMounted` / `onUnmounted`) |

## Components

| Component | Role |
|-----------|------|
| **`ShellSiteHeader`** | Site header — **`FugueAppHeader`** + nav, **`ShellLangToggle`**, `header.visualStyle` from `app.config` |
| **`ShellLangToggle`** | Locale switcher — alternate-language text link (2 locales); globe + dropdown (3+) |
| **`ShellPageHeader`** | Page title region under the site header |
| **`ShellAsidePlaceholder`** | Dashed placeholder for filter aside until a slice ships real filters |

## Theming

Runtime brand variants (demo/dev): **`useBrandTheme()`**, **`brand-theme`** plugin, and **`assets/css/brand-variants.css`** on this layer. Portable helpers: **`@altafusion/fugue-ui/utils/brandTheme`**. Site look stays build-time via **`createAppConfig({ theme })`** and **`app/assets/css/themes/{app}-theme.css`**.

## Route meta

```ts
definePageMeta({
  layout: 'product',
  title: 'Projects',
  breadcrumb: 'Projects',
  shell: { footer: false, mainPadding: true },
  nav: {
    primary: 'projects',
    aside: ['filters'],
  },
})
```

**App overrides:** place `app/components/ShellSiteHeader.vue` in the app to customize header actions — reuse **`useShellSiteHeader()`** from the shell layer. Logo and title come from **`app.config`** (see below).

## App settings (`app.config.ts`)

Product apps declare branding in **`app/app.config.ts`** (typed via **`@altafusion/shell`**):

```ts
export default defineAppConfig({
  brand: {
    name: 'My App',
    logo: '/my-logo.svg',      // public/ asset path
    logoClass: 'dark:brightness-0 dark:invert', // optional img classes
    favicon: '/favicon.svg',
  },
  seo: {
    title: 'My App',
    titleTemplate: '%s — My App',
    description: '…',
  },
  header: {
    showColorMode: true,
  },
  ui: { /* Nuxt UI tokens */ },
})
```

| Block | Purpose |
|-------|---------|
| **`brand`** | Display name, logo/favicon paths, optional **`logoClass`** — **`ShellBrandLogo`**, footer, login forms |
| **`seo`** | Default **`useSeoMeta`** via shell plugin |
| **`header`** | Color mode toggle; title override (else **`brand.name`**) |
| **`ui`** | Nuxt UI semantic colors |

**Fallback:** `runtimeConfig.public.appName` and `appNav` in **`nuxt.config.ts`** when env-specific wiring is needed. **Docs apps** (Docus) use **`site`** + **`app.head`** instead — not this block.

## Setup

```ts
// nuxt.config.ts — apps must still extend fugue-theme for @nuxt/eslint + theme tokens
export default defineNuxtConfig(createAppConfig({
  extends: ['@altafusion/fugue-theme', '@altafusion/shell'],
  runtimeConfig: {
    public: {
      appNav: [
        { label: 'Home', to: '/', icon: 'i-lucide-home', id: 'home' },
      ],
    },
  },
}, { enableNuxtUI: true }))
```

Shell extends `@altafusion/fugue-ui` (which extends `fugue-nuxt-ui`). The **`product`** layout requires Nuxt UI (`enableNuxtUI: true` on the app).

**Multilingual sites:** use **`labelKey`** on `appNav` items and translate in the app’s **`i18n/locales/*.yaml`**. Paths stay locale-neutral (`to: '/about'`); **`useAppNav`** applies **`localePath()`**. See **`/fugue-content/starter-template/i18n`** in developer-docs.
