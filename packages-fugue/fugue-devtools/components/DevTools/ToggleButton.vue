<script setup lang="ts">
import { DEVTOOLS_LAYER_CLASSES } from '#devtools/utils/devtoolsLayers'

const {
  open,
  ariaLabel = 'Dev Tools',
} = defineProps<{
  open: boolean
  ariaLabel?: string
}>()

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <UTooltip
    text="Toggle Dev Tools"
    :ui="{ content: DEVTOOLS_LAYER_CLASSES.menu }"
  >
    <UButton
      icon="i-lucide-settings"
      :color="open ? 'primary' : 'neutral'"
      variant="ghost"
      size="sm"
      :aria-label="ariaLabel"
      :aria-pressed="open"
      @click="emit('toggle')"
    />
  </UTooltip>
</template>
