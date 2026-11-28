/**
 * Where the dev tools sit in the page's stacking order. Lowest to highest:
 *
 *   page content and sticky bars   <= 30
 *   site FloatingDocks             40  (FloatingDock's default)
 *   site overlays, Nuxt UI modals  50
 *   dev tools dock                 70
 *   dev tools drawer               75
 *   dev tools tooltips and menus   80
 *
 * The numbers live in `assets/css/devtools-panel.css` as CSS variables, so a plain stylesheet and the Vue components read the
 * same values. This file names those variables and the classes that apply them; nothing else in the layer hard-codes a z-index.
 */
export const DEVTOOLS_LAYER_VARS = {
  dock: '--devtools-z-dock',
  drawer: '--devtools-z-drawer',
  menu: '--devtools-z-menu',
} as const

export type DevToolsLayer = keyof typeof DEVTOOLS_LAYER_VARS

/** A CSS value for `FloatingDock`'s `zIndex` prop (or any `z-index`). */
export function devToolsLayerValue(layer: DevToolsLayer): string {
  return `var(${DEVTOOLS_LAYER_VARS[layer]})`
}

/** Plain classes (defined in `devtools-panel.css`, not Tailwind) that apply a layer, for the `ui` slots of Nuxt UI components. */
export const DEVTOOLS_LAYER_CLASSES = {
  dock: 'devtools-z-dock',
  drawer: 'devtools-z-drawer',
  menu: 'devtools-z-menu',
} as const satisfies Record<DevToolsLayer, string>
