<script setup lang="ts" generic="T extends RadioGroupItem[], VK extends GetItemKeys<T> = 'value'">
import type { GetItemKeys, GetModelValue, RadioGroupItem } from '@nuxt/ui'
import type { TileSelectorProps } from './tileSelector.shared'
import {
  applyHiddenIndicatorUi,
  hasTileExtras,
  mergeTileUi,
  normalizeTileItems,
  resolveNuxtTileVariant,
  resolveTileDescription,
  resolveTileLabel,
  resolveTileLabelItem,
  splitTileUi,
  usesInlineTileLabel,
} from './tileSelector.shared'
import TileSelectorLabel from './TileSelectorLabel.vue'

/**
 * Single-select tile picker on {@link URadioGroup}.
 *
 * Our `variant` picks {@link TILE_VARIANT_UI}; Nuxt gets {@link resolveNuxtTileVariant}
 * (`list` for pill/row/feature, `card` otherwise).
 *
 * Cross-variant layout fixes (indicator hidden is the default):
 * - Collapse Nuxt's sized indicator `container` via {@link HIDDEN_INDICATOR_GROUP_UI}
 * - Descriptions render via {@link TileSelectorLabel} from item `description` /
 *   `descriptionKey`; empty `#description` suppresses Nuxt's default fallback
 */
const props = withDefaults(defineProps<TileSelectorProps<T, VK>>(), {
  variant: 'card',
  color: 'primary',
  size: 'md',
  indicator: 'hidden',
  bare: false,
})

defineSlots<{
  legend?: () => unknown
  label?: (_slotProps: { item: RadioGroupItem & { id: string }, modelValue?: unknown }) => unknown
}>()

const model = defineModel<GetModelValue<T, VK, false>>()

const mergedUi = computed(() => mergeTileUi(props.variant ?? 'card', props.ui))
const splitUi = computed(() => splitTileUi(mergedUi.value))
const labelUi = computed(() => splitUi.value.labelUi)

const groupUi = computed(() => {
  const base = splitUi.value.groupUi
  return props.indicator === 'hidden'
    ? applyHiddenIndicatorUi(base)
    : base
})

const visibleItems = computed(() =>
  props.items
    ? normalizeTileItems(props.items)
    : undefined,
)

const nuxtVariant = computed(() => resolveNuxtTileVariant(props.variant))
</script>

<template>
  <UFormField
    v-if="!bare"
    :error="error"
    :required="required"
    :name="name"
    :class="props.class"
  >
    <URadioGroup
      v-model="model"
      :name="name"
      :legend="legend"
      :items="visibleItems"
      :default-value="defaultValue"
      :required="required"
      :disabled="disabled"
      :loop="loop"
      :color="color"
      :size="size"
      :orientation="orientation"
      :value-key="valueKey"
      :label-key="labelKey"
      :description-key="descriptionKey"
      :indicator="indicator"
      :highlight="highlight"
      :variant="nuxtVariant"
      :ui="groupUi"
    >
      <template v-if="$slots.legend" #legend>
        <slot name="legend" />
      </template>

      <template #label="slotProps">
        <slot name="label" v-bind="slotProps">
          <TileSelectorLabel
            v-if="usesInlineTileLabel(variant)"
            :layout="variant === 'feature' ? 'feature' : 'row'"
            :item="resolveTileLabelItem(slotProps.item, labelKey)"
            :description="resolveTileDescription(slotProps.item, descriptionKey)"
            :ui="labelUi"
          />
          <TileSelectorLabel
            v-else-if="hasTileExtras(slotProps.item) || resolveTileDescription(slotProps.item, descriptionKey)"
            :item="resolveTileLabelItem(slotProps.item, labelKey)"
            :description="resolveTileDescription(slotProps.item, descriptionKey)"
          />
          <span
            v-else
            class="font-medium text-default"
          >
            {{ resolveTileLabel(slotProps.item, labelKey) }}
          </span>
        </slot>
      </template>

      <template #description />
    </URadioGroup>
  </UFormField>

  <URadioGroup
    v-else
    v-model="model"
    :class="props.class"
    :name="name"
    :legend="legend"
    :items="visibleItems"
    :default-value="defaultValue"
    :required="required"
    :disabled="disabled"
    :loop="loop"
    :color="color"
    :size="size"
    :orientation="orientation"
    :value-key="valueKey"
    :label-key="labelKey"
    :description-key="descriptionKey"
    :indicator="indicator"
    :highlight="highlight"
    :variant="nuxtVariant"
    :ui="groupUi"
  >
    <template v-if="$slots.legend" #legend>
      <slot name="legend" />
    </template>

    <template #label="slotProps">
      <slot name="label" v-bind="slotProps">
        <TileSelectorLabel
          v-if="usesInlineTileLabel(variant)"
          :layout="variant === 'feature' ? 'feature' : 'row'"
          :item="resolveTileLabelItem(slotProps.item, labelKey)"
          :description="resolveTileDescription(slotProps.item, descriptionKey)"
          :ui="labelUi"
        />
        <TileSelectorLabel
          v-else-if="hasTileExtras(slotProps.item) || resolveTileDescription(slotProps.item, descriptionKey)"
          :item="resolveTileLabelItem(slotProps.item, labelKey)"
          :description="resolveTileDescription(slotProps.item, descriptionKey)"
        />
        <span
          v-else
          class="font-medium text-default"
        >
          {{ resolveTileLabel(slotProps.item, labelKey) }}
        </span>
      </slot>
    </template>

    <template #description />
  </URadioGroup>
</template>
