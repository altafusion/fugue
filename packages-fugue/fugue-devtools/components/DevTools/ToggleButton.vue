<script setup lang="ts">
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
    :ui="{ content: 'z-[60]' }"
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
