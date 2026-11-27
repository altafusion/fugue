<script setup lang="ts">
/**
 * Switches Nuxt UI's primary colour at runtime so a component can be judged against more than one accent. The same three
 * choices as the theme playground's selector, without its shell dependency.
 */
const appConfig = useAppConfig()

const items = [
  { label: 'Default', value: 'blue' },
  { label: 'Violet', value: 'violet' },
  { label: 'Green', value: 'green' },
]

const primary = computed({
  get: () => appConfig.ui.colors.primary,
  set: (value: string) => {
    appConfig.ui.colors.primary = value
  },
})
</script>

<template>
  <USelect
    v-model="primary"
    :items="items"
    size="sm"
    class="w-28"
    aria-label="Color Theme"
  />
</template>
