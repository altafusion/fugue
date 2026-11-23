<script setup lang="ts">
defineOptions({ name: 'ShellAsidePlaceholder' })

const { message = 'Filters — coming soon' } = defineProps<{
  message?: string
}>()
</script>

<template>
  <div
    class="rounded-md border border-dashed border-default px-4 py-6 text-center text-sm text-muted"
    role="status"
  >
    {{ message }}
  </div>
</template>
