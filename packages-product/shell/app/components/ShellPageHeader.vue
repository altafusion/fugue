<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="shell-page-header">
    <h1 class="shell-page-header__title">
      {{ title }}
    </h1>
  </div>
</template>

<style scoped>
.shell-page-header {
  padding: 0 var(--space-6, 1.5rem) var(--space-4, 1rem);
}

.shell-page-header__title {
  margin: 0;
  font-size: var(--font-size-2xl, 1.5rem);
  font-weight: var(--font-weight-semibold, 600);
}
</style>
