<script setup lang="ts" generic="T extends CheckboxGroupItem[], VK extends GetItemKeys<T> = 'value'">
import type { CheckboxGroupItem, GetItemKeys, GetModelValue } from '@nuxt/ui'
import type { TileSelectorMultipleProps } from './tileSelector.shared'
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
 * Multi-select tile picker on {@link UCheckboxGroup}.
 * Same item shapes and layout fixes as {@link TileSelector}.
 */
const props = withDefaults(defineProps<TileSelectorMultipleProps<T, VK>>(), {
  variant: 'card',
  color: 'primary',
  size: 'md',
  indicator: 'hidden',
})

defineSlots<{
  legend?: () => unknown
  label?: (_slotProps: { item: CheckboxGroupItem & { id: string } }) => unknown
}>()

const model = defineModel<GetModelValue<T, VK, true>>()

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
    :error="error"
    :required="required"
    :name="name"
    :class="props.class"
  >
    <UCheckboxGroup
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
      :icon="icon"
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
    </UCheckboxGroup>
  </UFormField>
</template>
