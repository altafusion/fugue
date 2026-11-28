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

Components under **`components/`** auto-import: **`AccentSectionCard`**, **`CopyToClipboard`**, **`TileSelector`** (+ **`TileSelectorMultiple`**), **`FileDropzone`**, **`FloatingDock`**.

**`AccentSectionCard`** composes **`UCard`** (`title`, `description`, `variant`, `as`, `class`) with a left stripe: semantic **`color`** (`primary`); optional **`palette`** (composer hex — **`ACCENT_SECTION_CARD_VISUAL_STYLE_COLORS`**); optional **`accentColor`** (CSS color). Optional **`tooltip`** (TileHintTooltip). Modal-style **`close`** + **`closeIcon`**; **`@close`** when dismissed.

## FloatingDock

A small bar fixed to the bottom of the page. The user drags it left and right by its grip (or with the arrow keys, Home and End from the focused grip), it remembers its position in `localStorage`, and its button opens a panel above it. Needs only Nuxt UI and VueUse.

```vue
<FloatingDock v-model:open="open" storage-key="my-app:dock" label="Tools">
  <!-- the panel's content; leave it out and the button only toggles `open` -->
</FloatingDock>
```

| Prop | |
|---|---|
| `storageKey` (required) | `localStorage` key the position is remembered under |
| `label` (required) | text on the open/close button; also names the grip and the panel |
| `defaultPercent` | where it starts, 0 (flush left) to 100 (flush right); default `50` |
| `align` | which end of the dock's box the bar sits at: `start`, `center` (default) or `end`. With `end` and `defaultPercent` `100` the bar's right end meets the page margin |
| `margin` | distance in px from each page edge at 0 and 100 percent; default `8` |
| `bottomClass` | Tailwind class for the distance from the bottom edge; default `bottom-20`. Pass a literal class that exists in your app's source, such as `bottom-4` |
| `v-model:open` | whether the panel is showing (or, with no slot, what the button toggles) |

Pieces: `components/FloatingDock.vue`, `composables/useDraggableDock.ts` (VueUse `useDraggable` turned into one saved percentage, plus the keys), and `lib/floating-dock-position.ts` (pure position math, unit tested).

Design choices worth keeping:

- **One percentage** places the dock (CSS `left` plus `translateX`), so nothing is measured and the first paint is correct.
- **Only the grip drags.** The label button only toggles the panel. Handlers sit on a plain element around the grip button because forwarding pointer events through `UButton` was unreliable.
- **One fixed width** (`w-56`) open or closed; the bar is centred in it and the panel is a separate box above it.
- **Teleported to `body`**, so no transformed ancestor becomes the fixed reference.

### Nuxt Studio moves fixed elements

Nuxt Studio (`nuxt-studio`, `runtime/utils/sidebar.js`, `adjustFixedElements`) sets the inline `left` of **every `position: fixed` element on the page** to its sidebar's width, or to nothing when the sidebar is collapsed, when it activates and each time its sidebar opens or closes. A dock placed with its own inline `left` was thrown off the page on load (`left` cleared, so `translateX(-50%)` pushed it half off-screen). So the dock sits in a fixed wrapper (`inset-0`, from a class so clearing the inline style leaves it alone) and is only `absolute` inside it. Studio shifts the wrapper, which also keeps the dock beside its sidebar, and the dock's percentage is measured in the wrapper (the `area` argument). Use `right`, `top` or `bottom` for any other fixed element; Studio only touches `left`.

Not done yet: docking to other edges, a minimized nub, auto-hide, touch checks on a phone. The position math follows the draggable control in Nuxt DevTools (`@devframes/hub`, MIT).

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
