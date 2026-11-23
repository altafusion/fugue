<script setup lang="ts">
import type { TileLabelItem, TileLabelUi } from './tileSelector.shared'
import TileHintTooltip from './TileHintTooltip.vue'
import { resolveTileIconClass, tileIconStyle, tileSemanticTextClass } from './tileSelector.shared'

/**
 * Tile title chrome for the RadioGroup/CheckboxGroup `#label` slot.
 *
 * Nuxt's `card` variant wraps that slot in a `<p>`. Only **phrasing** content is
 * valid inside `<p>` — a `<div>` makes the browser close the `<p>` early, leaving
 * an empty paragraph (extra vertical gap) and hoisting the real label out.
 * Use `<span>` + display utilities everywhere in this tree.
 */
withDefaults(defineProps<{
  item: TileLabelItem
  layout?: 'stacked' | 'row' | 'feature'
  description?: string
  /** Required for `row` / `feature` — from {@link mergeTileUi} via {@link splitTileUi}. */
  ui?: TileLabelUi
}>(), {
  layout: 'stacked',
})
</script>

<template>
  <span
    v-if="layout === 'row' || layout === 'feature'"
    :class="ui?.itemRoot"
  >
    <span
      v-if="item.icon || item.imageSrc"
      :class="ui?.itemLeading"
    >
      <UIcon
        v-if="item.icon"
        mode="svg"
        :name="item.icon"
        :class="resolveTileIconClass('row', item.iconClass)"
        :style="tileIconStyle()"
        aria-hidden="true"
      />
      <img
        v-else-if="item.imageSrc"
        :src="item.imageSrc"
        alt=""
        class="size-10 object-contain"
      >
    </span>
    <span class="min-w-0 flex-1 flex flex-col gap-1">
      <span class="flex items-center gap-x-1">
        <span :class="ui?.itemLabel">
          {{ item.label }}
        </span>
        <TileHintTooltip
          v-if="item.tooltip"
          :text="item.tooltip"
          :label="item.label"
        />
      </span>
      <span
        v-if="item.hint"
        :class="[ui?.itemHint, tileSemanticTextClass(item.hint.color)]"
      >
        {{ item.hint.text }}
      </span>
      <span
        v-if="description"
        :class="ui?.itemDescription"
      >
        {{ description }}
      </span>
    </span>
  </span>

  <span
    v-else
    class="flex w-full flex-col items-center text-center"
  >
    <span class="flex items-center justify-center gap-x-1 leading-none">
      <UIcon
        v-if="item.icon"
        mode="svg"
        :name="item.icon"
        :class="resolveTileIconClass('stacked', item.iconClass)"
        :style="tileIconStyle()"
        aria-hidden="true"
      />
      <img
        v-else-if="item.imageSrc"
        :src="item.imageSrc"
        alt=""
        class="size-6 object-cover"
      >
      <span class="text-sm font-medium leading-none">
        {{ item.label }}
      </span>
      <TileHintTooltip
        v-if="item.tooltip"
        :text="item.tooltip"
        :label="item.label"
      />
    </span>
    <span
      v-if="description"
      class="mt-2 text-sm text-muted"
    >
      {{ description }}
    </span>
  </span>
</template>
