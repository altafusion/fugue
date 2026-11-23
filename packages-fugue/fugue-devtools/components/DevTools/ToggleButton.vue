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
  <UButton
    icon="i-lucide-settings"
    :color="open ? 'primary' : 'neutral'"
    variant="ghost"
    size="sm"
    :aria-label="ariaLabel"
    title="Toggle Dev Tools"
    :aria-pressed="open"
    @click="emit('toggle')"
  />
</template>
