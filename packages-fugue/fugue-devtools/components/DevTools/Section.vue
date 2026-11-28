<script setup lang="ts">
const {
  title,
  class: className,
} = defineProps<{
  title?: string
  class?: string
}>()
</script>

<template>
  <section class="devtools-panel__section" :class="className">
    <div
      v-if="title"
      class="devtools-panel__section-title"
    >
      {{ title }}
    </div>
    <slot />
  </section>
</template>
