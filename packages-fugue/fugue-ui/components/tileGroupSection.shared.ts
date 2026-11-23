import type { HTMLAttributes } from 'vue'

export type TileGroupSectionVariant = 'field' | 'category'

export interface TileGroupSectionUi {
  root?: HTMLAttributes['class']
  title?: HTMLAttributes['class']
  note?: HTMLAttributes['class']
  required?: HTMLAttributes['class']
  optional?: HTMLAttributes['class']
}

type SlotClass = HTMLAttributes['class']

function mergeUiSlot(base: SlotClass | undefined, extra: SlotClass | undefined): SlotClass | undefined {
  if (base === undefined)
    return extra
  if (extra === undefined)
    return base
  return [base, extra] as SlotClass
}

const TILE_GROUP_SECTION_COMMON_UI: TileGroupSectionUi = {
  note: 'text-sm text-muted',
  required: 'text-error',
  optional: 'text-muted',
}

export const TILE_GROUP_SECTION_VARIANT_UI: Record<TileGroupSectionVariant, TileGroupSectionUi> = {
  field: {
    ...TILE_GROUP_SECTION_COMMON_UI,
    title: 'm-0 text-sm font-medium text-muted',
  },
  category: {
    ...TILE_GROUP_SECTION_COMMON_UI,
    title: 'm-0 text-sm font-medium uppercase tracking-wide text-muted',
  },
}

/** Merge variant presets with optional per-slot `ui` overrides (strings / class arrays). */
export function mergeTileGroupSectionUi(
  variant: TileGroupSectionVariant,
  ui?: TileGroupSectionUi,
): TileGroupSectionUi {
  const preset = TILE_GROUP_SECTION_VARIANT_UI[variant] ?? TILE_GROUP_SECTION_VARIANT_UI.field
  if (!ui)
    return preset

  const keys = new Set([
    ...Object.keys(preset),
    ...Object.keys(ui),
  ])

  const merged: TileGroupSectionUi = {}
  for (const key of keys) {
    const slot = key as keyof TileGroupSectionUi
    merged[slot] = mergeUiSlot(preset[slot], ui[slot])
  }
  return merged
}
