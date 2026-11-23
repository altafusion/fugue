import type { ButtonProps, CardProps } from '@nuxt/ui'
import type { ClassNameValue } from 'tailwind-merge'
import type { HTMLAttributes } from 'vue'
import { twMerge } from 'tailwind-merge'

/** Nuxt UI semantic role for the left accent stripe only (not {@link UCard} `variant`). */
export type AccentSectionCardColor
  = | 'primary'
    | 'success'
    | 'info'
    | 'warning'
    | 'error'
    | 'neutral'

/** Named composer palette keys (hex parity with UI React `AccentSectionCardVisualStyle`). */
export type AccentSectionCardVisualStyle
  = | 'amber'
    | 'blue'
    | 'cyan'
    | 'emerald'
    | 'fuchsia'
    | 'gray'
    | 'red'
    | 'sky'
    | 'violet'

/** Hex swatch for each {@link AccentSectionCardVisualStyle} — matches UI React palette. */
export const ACCENT_SECTION_CARD_VISUAL_STYLE_COLORS: Record<AccentSectionCardVisualStyle, string> = {
  blue: '#60a5fa',
  fuchsia: '#e879f9',
  violet: '#a78bfa',
  gray: '#d1d5db',
  emerald: '#34d399',
  cyan: '#22d3ee',
  sky: '#7dd3fc',
  amber: '#ffb900',
  red: '#fb2c36',
}

/** {@link UButton} props for {@link AccentSectionCard} `close` (icon comes from `closeIcon`). */
export type AccentSectionCardCloseConfig = Omit<
  ButtonProps,
  'icon' | 'leadingIcon' | 'trailingIcon'
> & {
  'aria-label'?: string
}

export type AccentSectionCardCardUi = NonNullable<CardProps['ui']>

type CardUiSlot = NonNullable<AccentSectionCardCardUi['root']>

function asCardUiSlot(value: AccentSectionCardCardUi['root'] | SlotClass | undefined): CardUiSlot | undefined {
  if (value === null || value === undefined)
    return undefined
  return value as CardUiSlot
}

export interface AccentSectionCardUi {
  root?: HTMLAttributes['class']
  card?: AccentSectionCardCardUi
  titleRow?: HTMLAttributes['class']
  title?: HTMLAttributes['class']
  icon?: HTMLAttributes['class']
  /** Region below the title row (named `#header` slot). */
  headerSlot?: HTMLAttributes['class']
  body?: HTMLAttributes['class']
  closeButton?: HTMLAttributes['class']
  overlay?: HTMLAttributes['class']
}

type SlotClass = HTMLAttributes['class']

function isSlotClassReplacer(value: unknown): boolean {
  if (value === undefined || value === null)
    return false
  if (typeof value === 'function')
    return true
  return typeof value === 'object' && !Array.isArray(value)
}

function asClassNameValue(value: SlotClass): ClassNameValue {
  return value as ClassNameValue
}

function mergeUiSlot(base: SlotClass | undefined, extra: SlotClass | undefined): SlotClass | undefined {
  if (base === undefined)
    return extra
  if (extra === undefined)
    return base
  if (isSlotClassReplacer(base) || isSlotClassReplacer(extra))
    return extra
  return twMerge(asClassNameValue(base), asClassNameValue(extra))
}

function mergeCardSlot(base: CardUiSlot | undefined, extra: CardUiSlot | undefined): CardUiSlot | undefined {
  if (base === undefined)
    return extra
  if (extra === undefined)
    return base
  if (isSlotClassReplacer(base) || isSlotClassReplacer(extra))
    return extra
  return twMerge(asClassNameValue(base as SlotClass), asClassNameValue(extra as SlotClass)) as CardUiSlot
}

function mergeCardUi(
  base: AccentSectionCardCardUi | undefined,
  extra: AccentSectionCardCardUi | undefined,
): AccentSectionCardCardUi | undefined {
  if (!base)
    return extra
  if (!extra)
    return base
  const merged: AccentSectionCardCardUi = {
    ...base,
    ...extra,
  }
  const keys = new Set([
    ...Object.keys(base),
    ...Object.keys(extra),
  ]) as Set<keyof AccentSectionCardCardUi>
  for (const key of keys)
    merged[key] = mergeCardSlot(asCardUiSlot(base[key]), asCardUiSlot(extra[key]))

  return merged
}

export const ACCENT_SECTION_CARD_DEFAULT_UI: AccentSectionCardUi = {
  root: 'relative w-full',
  card: {
    root: 'w-full min-w-0 overflow-hidden border-2 border-default bg-default shadow-sm transition-shadow duration-300 border-s-4 hover:shadow-md',
    header:
      'border-b border-default py-[var(--accent-section-header-py)] px-[var(--accent-section-header-px)]',
    body: 'px-6 pt-4 pb-5',
  },
  titleRow: 'accent-section-title-row min-w-0 flex-1 flex items-center gap-2',
  title: 'accent-section-title',
  icon: 'accent-section-icon',
  headerSlot: 'space-y-4',
  closeButton: 'shrink-0',
  overlay: 'absolute inset-0 z-[5] cursor-not-allowed bg-default/50',
}

const ACCENT_BORDER_CLASS: Record<AccentSectionCardColor, string> = {
  primary: 'border-s-primary',
  success: 'border-s-success',
  info: 'border-s-info',
  warning: 'border-s-warning',
  error: 'border-s-error',
  neutral: 'border-s-neutral',
}

/** Left accent stripe class for `color` (muted when disabled). */
export function accentSectionCardBorderAccentClass(
  color: AccentSectionCardColor,
  disabled: boolean,
): string {
  if (disabled)
    return 'border-s-neutral'
  return ACCENT_BORDER_CLASS[color]
}

export interface ResolveAccentSectionCardAccentInput {
  /** Any CSS color for the left stripe (highest precedence). */
  accentColor?: string
  /** Named composer palette key (hex from {@link ACCENT_SECTION_CARD_VISUAL_STYLE_COLORS}). */
  palette?: AccentSectionCardVisualStyle
  /** Nuxt UI semantic stripe color (default `primary`); not {@link UCard} `variant`. */
  color?: AccentSectionCardColor
  disabled?: boolean
}

export type ResolvedAccentSectionCardAccent
  = | { mode: 'semantic', borderClass: string }
    | { mode: 'custom', borderClass: string, style: Record<string, string> }

/**
 * Resolves the left accent stripe for {@link AccentSectionCard}.
 *
 * **Precedence** (highest first):
 * 1. `accentColor` — any CSS color
 * 2. `palette` — named key from {@link ACCENT_SECTION_CARD_VISUAL_STYLE_COLORS} (React composer palette parity)
 * 3. `color` — Nuxt UI semantic role (default `primary`)
 *
 * When `disabled` is true, custom accents are ignored: muted neutral stripe (same as
 * semantic disabled), neutral border, and no inline hex on the card root.
 */
export function resolveAccentSectionCardAccent(
  input: ResolveAccentSectionCardAccentInput,
): ResolvedAccentSectionCardAccent {
  const color = input.color ?? 'primary'
  const disabled = input.disabled ?? false

  if (disabled) {
    return {
      mode: 'semantic',
      borderClass: accentSectionCardBorderAccentClass(color, true),
    }
  }

  if (input.accentColor !== undefined && input.accentColor !== '') {
    return {
      mode: 'custom',
      borderClass: 'border-s-4',
      style: { borderInlineStartColor: input.accentColor },
    }
  }

  if (input.palette !== undefined) {
    return {
      mode: 'custom',
      borderClass: 'border-s-4',
      style: { borderInlineStartColor: ACCENT_SECTION_CARD_VISUAL_STYLE_COLORS[input.palette] },
    }
  }

  return {
    mode: 'semantic',
    borderClass: accentSectionCardBorderAccentClass(color, false),
  }
}

const ACCENT_SECTION_CARD_DEFAULT_CLOSE_BUTTON = {
  'type': 'button' as const,
  'color': 'neutral' as const,
  'variant': 'ghost' as const,
  'size': 'xs' as const,
  'square': true,
  'aria-label': 'Close',
}

/** Modal-style `close` prop → {@link UButton} bindings (hidden when falsy). */
export function resolveAccentSectionCardClose(
  close: boolean | AccentSectionCardCloseConfig | undefined,
): { show: boolean, buttonProps: Record<string, unknown> } {
  if (!close)
    return { show: false, buttonProps: {} }

  if (close === true) {
    return {
      show: true,
      buttonProps: { ...ACCENT_SECTION_CARD_DEFAULT_CLOSE_BUTTON },
    }
  }

  return {
    show: true,
    buttonProps: {
      ...ACCENT_SECTION_CARD_DEFAULT_CLOSE_BUTTON,
      ...close,
    },
  }
}

/** Merge default presets with optional per-slot `ui` overrides. */
export function mergeAccentSectionCardUi(ui?: AccentSectionCardUi): AccentSectionCardUi {
  const preset = ACCENT_SECTION_CARD_DEFAULT_UI
  if (!ui)
    return preset

  return {
    root: mergeUiSlot(preset.root, ui.root),
    card: mergeCardUi(preset.card, ui.card),
    titleRow: mergeUiSlot(preset.titleRow, ui.titleRow),
    title: mergeUiSlot(preset.title, ui.title),
    icon: mergeUiSlot(preset.icon, ui.icon),
    headerSlot: mergeUiSlot(preset.headerSlot, ui.headerSlot),
    body: mergeUiSlot(preset.body, ui.body),
    closeButton: mergeUiSlot(preset.closeButton, ui.closeButton),
    overlay: mergeUiSlot(preset.overlay, ui.overlay),
  }
}

/** Build `:ui` for {@link UCard} including accent border and shell `root` classes on `root`. Inline hex is bound on {@link UCard} via `:style` in the component. */
export function buildAccentSectionCardUCardUi(
  merged: AccentSectionCardUi,
  accentClass: string,
  disabled: boolean,
): AccentSectionCardCardUi {
  const card = merged.card ?? {}
  const rootExtra = disabled ? 'border-muted' : undefined
  const accentSlot = accentClass
    ? asCardUiSlot(accentClass)
    : undefined
  return {
    ...card,
    root: mergeCardSlot(
      asCardUiSlot(card.root),
      mergeCardSlot(asCardUiSlot(rootExtra), accentSlot),
    ),
    header: asCardUiSlot(card.header),
    body: mergeCardSlot(asCardUiSlot(card.body), asCardUiSlot(merged.body)),
  }
}
