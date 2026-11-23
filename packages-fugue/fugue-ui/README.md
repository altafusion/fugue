# @altafusion/fugue-ui

Nuxt layer for **generic** Vue UI primitives on Nuxt UI — part of the **Fugue** family (`@altafusion/fugue-storage`, `@altafusion/fugue-devtools`, …). Reusable across Nuxt apps; product-specific layout stays in app layers until promotion here is warranted.

## Stack

```text
@altafusion/fugue-ui
  extends → @altafusion/fugue-nuxt-ui   unbranded Tailwind + @nuxt/ui + @nuxt/eslint
              extends → @altafusion/nuxt-base
```

Extend **`@altafusion/fugue-theme`** as a **sibling** when optional Fugue tokens are needed. **`@nuxt/eslint`** requires a direct extend of **`fugue-nuxt-ui`**, **`@altafusion/fugue-theme`**, or another layer that registers the module (see **`packages-platform/nuxt-base/modules.ts`**).

Portable brand helpers: **`@altafusion/fugue-ui/utils/brandTheme`**.

## Usage

```ts
export default defineNuxtConfig({
  extends: ['@altafusion/fugue-theme', '@altafusion/fugue-ui'],
})
```

Components under **`components/`** auto-import: **`AccentSectionCard`**, **`CopyToClipboard`**, **`TileSelector`** (+ **`TileSelectorMultiple`**), **`FileDropzone`**.

**`AccentSectionCard`** composes **`UCard`** (`title`, `description`, `variant`, `as`, `class`) with a left stripe: semantic **`color`** (`primary`); optional **`palette`** (composer hex — **`ACCENT_SECTION_CARD_VISUAL_STYLE_COLORS`**); optional **`accentColor`** (CSS color). Optional **`tooltip`** (TileHintTooltip). Modal-style **`close`** + **`closeIcon`**; **`@close`** when dismissed.

## Component naming

- **Generic primitives** — **`components/<Widget>.vue`** at layer root → **`<CopyToClipboard />`**. No `F*` prefix.
- **Widget families** — subfolder namespace: **`components/Forms/DateRange.vue`** → **`FormsDateRange`**.
- **Do not** use single-letter prefixes (**`U*`** is Nuxt UI only).

When promoting from an app, keep the same path under **`components/`** so auto-import names stay stable.

## VueUse

Direct **`@vueuse/core`** imports in this package. Do **not** add **`@vueuse/nuxt`** — prefer explicit imports for tree-shaking.

## Consumers

> **Local — do not copy-sync.** Repo wiring, ports, catalog keys, consuming apps, and docs-site links.

- **`@altafusion/shell`** extends fugue-ui transitively; **`ShellSiteHeader`** + **`useShellSiteHeader()`** wire **`FugueAppHeader`** (**`visualStyle`**: `default`, `landing-fixed`, `landing-static`). Override **`ShellSiteHeader`** only for extra slots (e.g. Studio edit).
- **`packages-consumer/fugue-content`**, **`templates/fugue-content-site`**.
