# @altafusion/fugue-ui

## 0.6.3

### Patch Changes

- @altafusion/fugue-nuxt-ui@0.6.3

## 0.6.2

### Patch Changes

- daa45b0: Fix the dev tools drawer showing the page through it, and put the dev tools above everything on the site.
  
  - The drawer surface was `bg-muted`, which a theme may make translucent (fugue-theme's black canvas sets `--ui-bg-muted` to `rgb(255 255 255 / 0.05)`), so photo tiles, their buttons and other docks showed through its text. It is now painted over a solid `--ui-bg` base.
  - A drag that ends over the open drawer no longer drops onto a tile behind it, and dragging across it starts no drawer gesture.
  - Stacking is explicit and lives in one place (CSS variables in `devtools-panel.css`): site docks 40, site overlays 50, dev tools dock 70, drawer 75, tooltips and menus 80. The scattered `z-50` and `z-[60]` are gone.
  - `FloatingDock` gets a `zIndex` prop (default `40`, applied to the wrapper). The dev tools dock passes its own.
  - The drawer and the dock's bar are `#1e1e77` in dark mode (solid, so the theme cannot make them translucent). Both are restyled with Nuxt UI's `ui` convention: `<DevToolsPanel :ui="{ bar, panel }" />`. `FloatingDock` gets the same: `ui: { bar, panel }`, merged over its defaults.
- @altafusion/fugue-nuxt-ui@0.6.2

## 0.6.1

### Patch Changes

- @altafusion/fugue-nuxt-ui@0.6.1

## 0.6.0

### Patch Changes

- e07bde1: Add `FloatingDock`: a bar fixed to the bottom of the page that the user drags by its grip (or moves with the arrow keys), that remembers its position, and whose button opens a panel above it. Set `storage-key` and `label`.
  
  `FloatingDock` also takes `align` (which end of its box the bar sits at) and `margin` (distance from the page edges), so a dock can line up with something beside it.
- @altafusion/fugue-nuxt-ui@0.6.0

## 0.5.0

### Patch Changes

- @altafusion/fugue-nuxt-ui@0.5.0

## 0.4.0

### Patch Changes

- @altafusion/fugue-nuxt-ui@0.4.0

## 0.3.5

### Patch Changes

- @altafusion/fugue-nuxt-ui@0.3.5

## 0.3.4

### Patch Changes

- Updated dependencies [153c441]
  - @altafusion/fugue-nuxt-ui@0.3.4

## 0.3.3

### Patch Changes

- @altafusion/fugue-nuxt-ui@0.3.3

## 0.3.2

### Patch Changes

- @altafusion/fugue-nuxt-ui@0.3.2

## 0.3.1

### Patch Changes

- @altafusion/fugue-nuxt-ui@0.3.1

## 0.3.0

### Patch Changes

- @altafusion/fugue-nuxt-ui@0.3.0

## 0.2.0

### Minor Changes

- 7767e60: Rebrand for the public release. In `@altafusion/shell`, `CODERMAR_BRANDS`, `CODERMAR_BRAND_THEME` and `utils/codermarBrandTheme` become `ALTAFUSION_*` and `utils/altafusionBrandTheme`, and the brand cookie key is now `altafusion:brand`. In `@altafusion/msw`, the `codermarMsw*` exports become `altafusionMsw*`. The site settings schema `$id` is now `https://altafusion.com/schemas/site-settings.json`. Package descriptions and docs no longer reference private sites.

### Patch Changes

- Updated dependencies [7767e60]
  - @altafusion/fugue-nuxt-ui@0.2.0

## 0.1.1

### Patch Changes

- @altafusion/fugue-nuxt-ui@0.1.1
