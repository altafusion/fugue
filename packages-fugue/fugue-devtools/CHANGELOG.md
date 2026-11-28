# @altafusion/fugue-devtools

## 0.6.2

### Patch Changes

- daa45b0: Fix the dev tools drawer showing the page through it, and put the dev tools above everything on the site.
  
  - The drawer surface was `bg-muted`, which a theme may make translucent (fugue-theme's black canvas sets `--ui-bg-muted` to `rgb(255 255 255 / 0.05)`), so photo tiles, their buttons and other docks showed through its text. It is now painted over a solid `--ui-bg` base.
  - A drag that ends over the open drawer no longer drops onto a tile behind it, and dragging across it starts no drawer gesture.
  - Stacking is explicit and lives in one place (CSS variables in `devtools-panel.css`): site docks 40, site overlays 50, dev tools dock 70, drawer 75, tooltips and menus 80. The scattered `z-50` and `z-[60]` are gone.
  - `FloatingDock` gets a `zIndex` prop (default `40`, applied to the wrapper). The dev tools dock passes its own.
  - The drawer and the dock's bar are `#1e1e77` in dark mode (solid, so the theme cannot make them translucent). Both are restyled with Nuxt UI's `ui` convention: `<DevToolsPanel :ui="{ bar, panel }" />`. `FloatingDock` gets the same: `ui: { bar, panel }`, merged over its defaults.
- Updated dependencies [daa45b0]
  - @altafusion/fugue-ui@0.6.2

## 0.6.1

### Patch Changes

- 1c6cc70: Fix a typecheck error in consuming sites: the plugin passed the runtime-config `defaultPosition` (typed `string`) to `panelPosition`, which only accepts `'left' | 'right' | 'top' | 'bottom'`.
  
  The layer now also ships its type augmentations (`$fugueDevtools`, runtime config) to sites that extend it, and the fugue-ui playground's devtools plugin is left out of the type-check of other apps, so `pnpm typecheck` is green.
- @altafusion/fugue-ui@0.6.1

## 0.6.0

### Minor Changes

- ae2d33b: Make `DevToolsPanel` self-contained: mount `<DevToolsPanel />` once and it owns its open state, shows a draggable dock, and opens the drawer on `?qetools` (the new default `openParams`; `?qetools=off` turns it off). Sections now register through `useDevTools().registerSection()` or `nuxtApp.$fugueDevtools`, each `public` or `privileged`, with a reactive `setAccessResolver`. `@altafusion/fugue-content` registers its Studio drafts as a privileged section when fugue-devtools is installed.

### Patch Changes

- 0a61dc0: Order the dev tools drawer header controls, left to right, as turn off (a circle-off icon), the four dock positions, then close.
- 0a61dc0: Show real tooltips (Nuxt UI `UTooltip`, above the drawer) on the dev tools header buttons and the toggle button, instead of the browser's slow native `title`.
- 39ccb17: Show the dev tools drawer's turn-off control as a circled X, after the close button (it was a power icon before it).
- Updated dependencies [e07bde1]
  - @altafusion/fugue-ui@0.6.0

## 0.5.0

### Minor Changes

- b60f37e: First public release of `@altafusion/fugue-devtools`, the dockable debugger drawer (qetools). It opens with `?devtools`, or with the params a site sets in `openParams`. The persist helpers and the storage code they use now live inside this package, under `@altafusion/fugue-devtools/persist`, and `@altafusion/fugue-devtools-persist` is gone.

### Patch Changes

- @altafusion/fugue-ui@0.5.0
