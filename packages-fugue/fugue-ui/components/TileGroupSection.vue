<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { TileGroupSectionUi, TileGroupSectionVariant } from './tileGroupSection.shared'
import { mergeTileGroupSectionUi } from './tileGroupSection.shared'

export type { TileGroupSectionUi, TileGroupSectionVariant }

type TileGroupSectionHeading = 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

const props = withDefaults(defineProps<{
  title: string
  /** Heading element for the section title (defaults to h3). */
  as?: TileGroupSectionHeading
  /** Helper under the title (e.g. input note). */
  note?: string
  /**
   * When true → "Required" badge; when false → "Optional" badge;
   * when omitted/undefined → no badge.
   */
  required?: boolean
  /** Title styling preset — `field` for main labels, `category` for nested group headings. */
  variant?: TileGroupSectionVariant
  class?: HTMLAttributes['class']
  ui?: TileGroupSectionUi
}>(), {
  as: 'h3',
  variant: 'field',
})

const mergedUi = computed(() => mergeTileGroupSectionUi(props.variant, props.ui))
</script>

<template>
  <div class="space-y-2" :class="[mergedUi.root, props.class]">
    <div class="flex flex-wrap items-start gap-2">
      <component
        :is="props.as"
        :class="mergedUi.title"
      >
        {{ props.title }}
      </component>
      <span
        v-if="props.required === true"
        class="text-xs font-normal"
        :class="mergedUi.required"
      >
        (Required)
      </span>
      <span
        v-else-if="props.required === false"
        class="text-xs font-normal"
        :class="mergedUi.optional"
      >
        (Optional)
      </span>
    </div>
    <p
      v-if="props.note"
      :class="mergedUi.note"
    >
      {{ props.note }}
    </p>
    <slot />
  </div>
</template>
