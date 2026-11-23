import type {
  CheckboxGroupItem,
  CheckboxGroupProps,
  GetItemKeys,
  GetModelValue,
  RadioGroupItem,
  RadioGroupProps,
} from '@nuxt/ui'
import type { HTMLAttributes } from 'vue'

/**
 * Tile selector shared types, variant presets, and item normalizers.
 *
 * **Item copy (Nuxt UI aligned)**
 *
 * | Field | Role |
 * | --- | --- |
 * | `label` | Primary title (`URadioGroup` `#label` / `labelKey`) |
 * | `description` | Body helper (item field / `descriptionKey` → {@link TileSelectorLabel}) |
 * | `hint` | Inline caption on row/feature (`{ text, color? }` from workflow manifest) |
 * | `tooltip` | Optional lightbulb on the title |
 *
 * **Workflow manifest → tile item** (`mapTileOption`):
 * - `variant: pill` + string `hint` → item `tooltip` (title + lightbulb)
 * - other variants: string `hint` → `description`; `hint: { text, color? }` → item `hint`
 * - `description` → body (card / row / feature)
 *
 * **Styling:** {@link TILE_VARIANT_UI} presets + optional `:ui` merge;
 * row/feature label chrome uses `itemLabel`, `itemHint`, `itemDescription` slots
 * (split from group ui via {@link splitTileUi}).
 */

/** Visual layout for {@link TileSelector} / {@link TileSelectorMultiple}. */
export type TileSelectorVariant = 'card' | 'square' | 'pill' | 'row' | 'feature'

/** Row/feature variants render label + hint + description inside the custom `#label` slot. */
export function usesInlineTileLabel(variant: TileSelectorVariant | undefined): boolean {
  return variant === 'row' || variant === 'feature'
}

/**
 * Nuxt still sizes the indicator `container` by `size` (`md` → `h-5`) when
 * `indicator="hidden"`. `size-0` does **not** beat `h-5` (different tw-merge
 * groups), so the empty box kept stretching every tile. Mark the whole
 * container `sr-only` — control stays in the a11y tree, zero layout impact.
 * Also reset `<p>` label margins (card variant uses `<p>` for the label slot).
 */
export const HIDDEN_INDICATOR_GROUP_UI = {
  container: 'sr-only',
  // Zero margins — card still wraps labels in `<p>`; list uses `<label>` (preferred).
  label: 'm-0! p-0! leading-none',
} as const

/**
 * Map our tile `variant` → Nuxt RadioGroup/CheckboxGroup `variant`.
 *
 * Pill / row / feature use Nuxt `list` so the label slot is a real `<label>`,
 * not a `<p>`. App chrome sets `p { margin-bottom: var(--space-4) }` outside
 * `@layer utilities`, which beats Tailwind `m-0` and left a 16px gap under
 * every card-variant tile. `list` also skips card's `md` compound `p-3.5`.
 */
export function resolveNuxtTileVariant(
  variant: TileSelectorVariant | undefined,
): NonNullable<RadioGroupProps['variant']> {
  return variant === 'pill' || variant === 'row' || variant === 'feature'
    ? 'list'
    : 'card'
}

export type TileGroupUi = NonNullable<RadioGroupProps['ui']>

/** Extra slots for inline label chrome (row/feature). Not passed to URadioGroup. */
export const TILE_LABEL_UI_KEYS = [
  'itemRoot',
  'itemLeading',
  'itemLabel',
  /** Inline caption under the title (row/feature) — workflow manifest `hint: { text, color? }`. */
  'itemHint',
  /** Body copy — Nuxt UI `description` (workflow manifest `description`). */
  'itemDescription',
] as const
export type TileLabelUiKey = (typeof TILE_LABEL_UI_KEYS)[number]

export type TileUiClass = string | string[] | undefined | null | false

export type TileLabelUi = Partial<Record<TileLabelUiKey, TileUiClass>>

/** RadioGroup `ui` slots + tile label slots. */
export type TileSelectorUi = TileGroupUi & TileLabelUi

/** A single Nuxt UI `ui` slot value (string / class array / falsy), as typed by the group's `ui` prop. */
type TileSlotClass = TileGroupUi[keyof TileGroupUi] | TileUiClass

/** Nuxt UI semantic colors (`primary`, `success`, `info`, …). */
export const TILE_SEMANTIC_COLORS = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'error',
  'neutral',
] as const

export type TileSemanticColor = (typeof TILE_SEMANTIC_COLORS)[number]

/** Inline caption on row/feature tiles — workflow manifest `hint: { text, color? }`. */
export interface TileInlineHint {
  text: string
  color?: TileSemanticColor
}

/** Map a Nuxt UI semantic color to a text utility class (static strings for Tailwind). */
const TILE_SEMANTIC_TEXT_CLASS: Record<TileSemanticColor, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  success: 'text-success',
  info: 'text-info',
  warning: 'text-warning',
  error: 'text-error',
  neutral: 'text-neutral',
}

export function tileSemanticTextClass(color?: TileSemanticColor): string | undefined {
  return color ? TILE_SEMANTIC_TEXT_CLASS[color] : undefined
}

/** Optional tile chrome on object items (ignored by Nuxt UI, used by {@link TileSelectorLabel}). */
export interface TileItemExtras {
  icon?: string
  iconClass?: string
  imageSrc?: string
  /** Lightbulb tooltip on the title. */
  tooltip?: string
  /** Inline caption (row/feature) — workflow manifest `hint: { text, color? }`. */
  hint?: TileInlineHint
  hidden?: boolean
}

export type TileLabelItem = TileItemExtras & {
  id?: string
  label?: string
  description?: string
  value?: unknown
  [key: string]: unknown
}

export interface TileSelectorProps<
  T extends RadioGroupItem[] = RadioGroupItem[],
  VK extends GetItemKeys<T> = 'value',
> extends Pick<
    RadioGroupProps<T, VK>,
    | 'items'
    | 'legend'
    | 'name'
    | 'required'
    | 'disabled'
    | 'color'
    | 'size'
    | 'orientation'
    | 'valueKey'
    | 'labelKey'
    | 'descriptionKey'
    | 'indicator'
    | 'loop'
    | 'defaultValue'
    | 'highlight'
  > {
  ui?: TileSelectorUi
  error?: string
  variant?: TileSelectorVariant
  /** Skip the outer {@link UFormField} when a parent already owns label/error chrome. */
  bare?: boolean
  /** Extra classes for the outermost element. Accepts any Vue class binding. */
  class?: HTMLAttributes['class']
}

export interface TileSelectorMultipleProps<
  T extends CheckboxGroupItem[] = CheckboxGroupItem[],
  VK extends GetItemKeys<T> = 'value',
> extends Pick<
    CheckboxGroupProps<T, VK>,
    | 'items'
    | 'legend'
    | 'name'
    | 'required'
    | 'disabled'
    | 'color'
    | 'size'
    | 'orientation'
    | 'valueKey'
    | 'labelKey'
    | 'descriptionKey'
    | 'indicator'
    | 'loop'
    | 'defaultValue'
    | 'highlight'
    | 'icon'
  > {
  ui?: TileSelectorUi
  error?: string
  variant?: TileSelectorVariant
  /** Extra classes for the outermost element. Accepts any Vue class binding. */
  class?: HTMLAttributes['class']
}

export type TileSelectorModelValue<
  T extends RadioGroupItem[] = RadioGroupItem[],
  VK extends GetItemKeys<T> = 'value',
> = GetModelValue<T, VK, false>

export type TileSelectorMultipleModelValue<
  T extends CheckboxGroupItem[] = CheckboxGroupItem[],
  VK extends GetItemKeys<T> = 'value',
> = GetModelValue<T, VK, true>

/**
 * Nuxt `card` compounds `border-muted` (too faint inactive). Override to
 * `border-default` for all variants; checked state uses primary.
 */
const checkedItemSurface: string[] = [
  'border-default',
  'has-data-[state=checked]:bg-primary/10',
  'has-data-[state=checked]:border-primary',
]

const tileGridFieldset: string[] = [
  'grid w-full grid-cols-1 gap-4',
  'md:grid-cols-[repeat(auto-fill,minmax(195px,1fr))]',
]

/** Wider columns so title + body copy fit without stacking awkwardly. */
const featureGridFieldset: string[] = [
  'grid w-full grid-cols-1 gap-4',
  'md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]',
]

export const TILE_VARIANT_UI: Record<TileSelectorVariant, TileSelectorUi> = {
  card: {
    fieldset: tileGridFieldset,
    item: [
      'rounded-xl shadow-sm',
      ...checkedItemSurface,
    ],
    wrapper: 'w-full text-center',
    // Body copy lives in {@link TileSelectorLabel}; hide Nuxt's duplicate `<p>`.
    description: 'hidden',
  },
  square: {
    fieldset: tileGridFieldset,
    item: [
      'rounded-none',
      ...checkedItemSurface,
    ],
    wrapper: 'w-full text-center',
    description: 'hidden',
  },
  /**
   * Compact chips — flex-wrap + fixed basis like `row`.
   * Hidden-indicator container collapse is applied in {@link TileSelector}
   * via {@link HIDDEN_INDICATOR_GROUP_UI} (all variants).
   */
  pill: {
    fieldset: 'flex flex-row flex-wrap gap-2',
    item: [
      // Nuxt list has no card padding; keep explicit chip padding only.
      'rounded-full border px-3 py-1.5',
      'shrink grow-0 basis-[11rem] max-w-[11rem]',
      'flex items-center justify-center gap-0',
      ...checkedItemSurface,
      'has-data-[state=checked]:text-primary',
    ],
    wrapper: 'm-0 flex w-full items-center justify-center p-0 leading-none',
    label: 'm-0 flex items-center justify-center p-0 leading-none',
  },
  /** Flex-wrap row tiles — fixed width so they don't stretch full-bleed. */
  row: {
    fieldset: 'flex flex-row flex-wrap gap-4',
    item: [
      // `border` required — Nuxt `list` (unlike `card`) does not add it.
      'flex-row items-center gap-4 rounded-xl border px-4 py-3 shadow-sm',
      'shrink grow-0 basis-[19.5rem] max-w-[19.5rem]',
      ...checkedItemSurface,
    ],
    wrapper: 'min-w-0 flex-1 text-left',
    label: 'block w-full',
    description: 'hidden',
    itemRoot: 'flex w-full items-center gap-4 text-left',
    itemLeading: 'flex shrink-0 items-center justify-center',
    itemLabel: 'text-base font-medium leading-tight text-default',
    itemHint: 'block text-sm font-medium text-muted',
    itemDescription: 'block text-sm text-muted',
  },
  /**
   * Card grid + left icon/title/description — AIS-style layout without per-tile accent colors.
   * Width: `featureGridFieldset` → `minmax(280px, 1fr)`.
   */
  feature: {
    fieldset: featureGridFieldset,
    item: [
      'flex-row items-start gap-3 rounded-xl border px-4 py-3 shadow-sm',
      ...checkedItemSurface,
    ],
    wrapper: 'min-w-0 flex-1 text-left',
    label: 'block w-full',
    description: 'hidden',
    itemRoot: 'flex w-full items-start gap-3 text-left',
    itemLeading: 'flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted',
    itemLabel: 'text-sm font-semibold leading-tight text-default',
    itemHint: 'block text-xs mb-1',
    itemDescription: 'block text-xs leading-relaxed text-muted',
  },
}

/** Default Lucide stroke for tile icons (Lucide bakes `2` into SVG presentation attrs). */
export const TILE_ICON_STROKE_WIDTH = '.85'

/** Overrides baked-in Lucide stroke on inline SVG (`mode="svg"`) via CSS variable. */
export const TILE_ICON_STROKE_CLASS = '[&_*]:![stroke-width:var(--tile-icon-stroke-width)]'

export const TILE_ICON_ROW_CLASS = `size-10 text-primary ${TILE_ICON_STROKE_CLASS}`

export const TILE_ICON_STACKED_CLASS = `size-5 text-primary ${TILE_ICON_STROKE_CLASS}`

export function tileIconStyle(strokeWidth: string = TILE_ICON_STROKE_WIDTH) {
  return { '--tile-icon-stroke-width': strokeWidth } as const
}

/** Merge caller `iconClass` with tile stroke override (stories often pass size/color only). */
export function resolveTileIconClass(
  layout: 'row' | 'stacked',
  iconClass?: string,
): string {
  if (!iconClass) {
    return layout === 'row'
      ? TILE_ICON_ROW_CLASS
      : TILE_ICON_STACKED_CLASS
  }
  return `${iconClass} ${TILE_ICON_STROKE_CLASS}`
}

// A `SlotClassReplacer` (function, or a plain object like `{ base, ... }`) can't be
// array-combined for class binding — it would stringify to "[object …]" and break styles.
// Only strings, arrays, and falsy values are safe tailwind-merge input.
function isSlotClassReplacer(value: TileSlotClass): boolean {
  if (typeof value === 'function')
    return true
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function mergeUiSlot(
  base: TileSlotClass,
  extra: TileSlotClass,
): TileSlotClass {
  if (base === undefined)
    return extra
  if (extra === undefined)
    return base
  // If either side is a replacer, it can't be safely concatenated; the caller's override wins.
  if (isSlotClassReplacer(base) || isSlotClassReplacer(extra))
    return extra
  // Combine as a class array (nested arrays are valid tailwind-merge input); the cast is
  // needed only because the slot type also permits a non-array `SlotClassReplacer`.
  return [base, extra] as TileSlotClass
}

/** Merge {@link HIDDEN_INDICATOR_GROUP_UI} under variant/`ui` so callers can still override. */
export function applyHiddenIndicatorUi(groupUi: TileGroupUi): TileGroupUi {
  return {
    ...groupUi,
    container: mergeUiSlot(HIDDEN_INDICATOR_GROUP_UI.container, groupUi.container),
    label: mergeUiSlot(HIDDEN_INDICATOR_GROUP_UI.label, groupUi.label),
  }
}

/** Deep-merge Nuxt UI `ui` slot classes with tile variant presets (arrays, not string concat). */
export function mergeTileUi(
  variant: TileSelectorVariant,
  ui?: TileSelectorUi,
): TileSelectorUi {
  const preset = TILE_VARIANT_UI[variant] ?? TILE_VARIANT_UI.card
  if (!ui)
    return preset

  const keys = new Set([
    ...Object.keys(preset),
    ...Object.keys(ui),
  ])

  const merged: Record<string, TileSlotClass> = {}
  for (const key of keys)
    merged[key] = mergeUiSlot(preset[key as keyof TileSelectorUi], ui[key as keyof TileSelectorUi])
  return merged as TileSelectorUi
}

/** Pick label-only ui slots out of a merged {@link TileSelectorUi}. */
function pickLabelUi(ui: TileSelectorUi): TileLabelUi {
  const labelUi: TileLabelUi = {}
  for (const key of TILE_LABEL_UI_KEYS) {
    const value = ui[key]
    if (value !== undefined)
      labelUi[key] = value
  }
  return labelUi
}

/** RadioGroup/CheckboxGroup slots only — strips {@link TILE_LABEL_UI_KEYS}. */
function pickGroupUi(ui: TileSelectorUi): TileGroupUi {
  const groupUi: Record<string, TileSlotClass> = { ...ui }
  for (const key of TILE_LABEL_UI_KEYS)
    delete groupUi[key]
  return groupUi as TileGroupUi
}

/** Split merged `ui` into RadioGroup/CheckboxGroup slots vs inline label chrome. */
export function splitTileUi(ui: TileSelectorUi): {
  groupUi: TileGroupUi
  labelUi: TileLabelUi
} {
  return {
    groupUi: pickGroupUi(ui),
    labelUi: pickLabelUi(ui),
  }
}

function isObjectItem(item: RadioGroupItem | CheckboxGroupItem): item is Record<string, unknown> {
  return typeof item === 'object' && item !== null
}

export function hasTileExtras(item: unknown): item is TileLabelItem {
  if (!isObjectItem(item as RadioGroupItem))
    return false
  const tile = item as TileItemExtras
  return Boolean(tile.icon || tile.imageSrc || tile.tooltip || tile.hint)
}

/** Resolve an item's display label, honoring a custom `labelKey` and primitive items. */
export function resolveTileLabel(
  item: RadioGroupItem | CheckboxGroupItem,
  labelKey?: string,
): string {
  if (!isObjectItem(item)) {
    return item == null
      ? ''
      : String(item)
  }
  const value = (item as Record<string, unknown>)[labelKey ?? 'label']
  return value == null
    ? ''
    : String(value)
}

/** Object shape for {@link TileSelectorLabel}, including primitive items. */
export function resolveTileLabelItem(
  item: RadioGroupItem | CheckboxGroupItem,
  labelKey?: string,
): TileLabelItem {
  if (!isObjectItem(item)) {
    return {
      label: resolveTileLabel(item, labelKey),
    }
  }
  return {
    ...item,
    label: resolveTileLabel(item, labelKey),
  } as TileLabelItem
}

/** Resolve an item's description, honoring a custom `descriptionKey` and primitive items. */
export function resolveTileDescription(
  item: RadioGroupItem | CheckboxGroupItem,
  descriptionKey?: string,
): string | undefined {
  if (!isObjectItem(item))
    return undefined
  const value = (item as Record<string, unknown>)[descriptionKey ?? 'description']
  return value == null
    ? undefined
    : String(value)
}

/** Drop `hidden` object items; pass string/number items through. */
export function normalizeTileItems<I extends readonly (RadioGroupItem | CheckboxGroupItem)[]>(
  items: I,
): I {
  return items.filter((item) => {
    if (!isObjectItem(item))
      return true
    return !item.hidden
  }) as unknown as I
}
