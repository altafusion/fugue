---
"@altafusion/fugue-devtools": patch
"@altafusion/fugue-ui": patch
---

Fix the dev tools drawer showing the page through it, and put the dev tools above everything on the site.

- The drawer surface was `bg-muted`, which a theme may make translucent (fugue-theme's black canvas sets `--ui-bg-muted` to `rgb(255 255 255 / 0.05)`), so photo tiles, their buttons and other docks showed through its text. It is now painted over a solid `--ui-bg` base.
- A drag that ends over the open drawer no longer drops onto a tile behind it, and dragging across it starts no drawer gesture.
- Stacking is explicit and lives in one place (CSS variables in `devtools-panel.css`): site docks 40, site overlays 50, dev tools dock 70, drawer 75, tooltips and menus 80. The scattered `z-50` and `z-[60]` are gone.
- `FloatingDock` gets a `zIndex` prop (default `40`, applied to the wrapper). The dev tools dock passes its own.
- The drawer and the dock's bar are `#1e1e77` in dark mode (solid, so the theme cannot make them translucent). Both are restyled with Nuxt UI's `ui` convention: `<DevToolsPanel :ui="{ bar, panel }" />`. `FloatingDock` gets the same: `ui: { bar, panel }`, merged over its defaults.
