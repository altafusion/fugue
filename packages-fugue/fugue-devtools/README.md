# @altafusion/fugue-devtools

Nuxt layer for a **generic non-modal dev tools drawer** — part of the **Fugue** family (`@altafusion/fugue-ui`, …). Project adapters supply domain sections, visibility rules, and persisted flag state.

## Stack

```text
@altafusion/fugue-devtools
  extends → @altafusion/fugue-ui → @altafusion/fugue-nuxt-ui → @altafusion/nuxt-base
```

Optionally extend **`@altafusion/fugue-theme`** alongside Fugue layers. **`@nuxt/eslint`** requires a direct extend of **`fugue-nuxt-ui`**, **`fugue-theme`**, or another layer that registers the module (see **`packages-platform/nuxt-base/modules.ts`**).

## Usage

```ts
export default defineNuxtConfig({
  extends: ['@altafusion/fugue-theme', '@altafusion/fugue-devtools'],
})
```

Mount the panel once and it works alone. No props, no open state, no toggle button:

```vue
<template>
  <UApp>
    <NuxtPage />
    <DevToolsPanel />
  </UApp>
</template>
```

Add **`?qetools`** to any URL. That turns the dev tools on and opens the drawer, and it stays on (localStorage) across navigation and reloads. **`?qetools=off`** turns them off. The drawer header has close (keeps the dock) and turn off (removes the dock, resets the saved state; only the param brings it back). The dock is draggable and the drawer can sit on any side. The default is the bottom, dock bottom-right.

Config (`runtimeConfig.public.fugueDevtools`): `openParams` (default `['qetools']`), `innerToggleParams`, `persistNamespace`, `persistKey`, `defaultPosition` (`'bottom'`).

### Stacking

The dev tools always sit above the site, including Nuxt UI modals and overlays. Lowest to highest:

| Level | z-index |
|---|---|
| page content and sticky bars | up to 30 |
| site `FloatingDock`s such as an editing-controls dock | 40 (the `FloatingDock` default) |
| site overlays and modals (Nuxt UI defaults) | 50 |
| dev tools dock | 70 |
| dev tools drawer | 75 |
| dev tools tooltips and menus | 80 |

The numbers are CSS variables (`--devtools-z-dock`, `--devtools-z-drawer`, `--devtools-z-menu`) declared once in `assets/css/devtools-panel.css`; `utils/devtoolsLayers.ts` names them and nothing else in the layer hard-codes a z-index. A site can override a variable in its own CSS. Keep a site's own dock at 40 and its overlays at 50 and the order holds.

In dark mode the drawer and the dock's bar are `#1e1e77` (a class, `dark:bg-[#1e1e77]`). `DevToolsPanel` takes Nuxt UI's `ui` prop with the same two slots as `FloatingDock` (`bar` and `panel`), merged over the defaults so your classes win. Use the same object for an editing-controls dock and the dev tools:

```vue
<DevToolsPanel :ui="{ bar: 'dark:bg-[#102040]', panel: 'dark:bg-[#102040]' }" />
```

`panel` is the drawer, `bar` is the dock's toggle bar. As with any Tailwind class, the literal has to appear in your app's source.

The open drawer is an opaque surface that takes the pointer: it is painted over a solid `--ui-bg` base, so a theme that makes `--ui-bg-muted` translucent (fugue-theme's black canvas does) cannot make it see-through, and a drag that ends over it is refused (`dropEffect: none`, the event stops there) instead of landing on a tile behind it. Drawer drags are off (`handle-only` with no handle), so dragging something across it starts no drawer gesture. Popovers and menus a section opens portal at Nuxt UI's z-50 and so open beneath the drawer; give those content `class="devtools-z-menu"`.

### Sections: registry first

```ts
// a plugin in your site or layer (no import of this package needed)
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:created', () => {
    nuxtApp.$fugueDevtools?.registerSection({
      id: 'my-section',
      label: 'My section',
      component: MySection,
      access: 'public', // or 'privileged' (the default)
    })
  })
})
```

Register in `app:created` so the order of layers does not matter. `registerSection` returns an unregister function; registering the same `id` again replaces it. `@altafusion/fugue-content` registers its Studio drafts this way, as a privileged section.

### Access

- `public` sections show to anyone who opened the drawer. Keep them to troubleshooting (the built-in **Diagnostics** is one).
- `privileged` sections (the default) need `useDevTools().setAccessResolver(() => boolean)`. It is reactive (read your session inside it), and until it returns `true` the section is hidden, not greyed out. Without a resolver, privileged sections show in development only.
- The gate is a convenience for the UI, **not a security boundary**. A privileged section must only do what the user could already do (local browser data, or API calls the server authorizes).

### Slots

`DevToolsPanel` slots are the second path: `dock` (replace the toggle; receives `open` and `toggle`), `header`, `section-<id>` (override how one section renders), the default slot (extra inline content, use `DevToolsSection`) and `footer`.

Not a Nuxt DevTools tab (out of scope for now). The registry does not depend on the UI, so a module could list the same sections later.

Composables: **`useDevTools()`** (chrome: enabled, open, dock position; the section registry).

Try it in the theme playground: `pnpm play:theme`, then open `http://localhost:7010/?qetools`.

## Component naming

Shell components live under **`components/DevTools/`** (folder namespace → **`DevTools*`** tags). Do not flatten to **`Panel.vue`** at layer root. Product-specific panels use their own adapter namespace (e.g. **`QeTools/*`** in a product adapter package).

## Consumers

> **Local — do not copy-sync.** Repo wiring, ports, catalog keys, consuming apps, and docs-site links.

- Altafusion product adapters register domain sections at the app layer; tune **`openParams`** / **`registerPlugin`** per app.
- Persist helpers live in this package under **`persist/`** (subpath **`@altafusion/fugue-devtools/persist`**, imported inside the layer as **`#devtools/persist`**). They do not import Vue or Nuxt.
