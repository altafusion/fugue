<script setup lang="ts">
const { label = 'Edit Content' } = defineProps<{
  label?: string
}>()

const { showEditContent, openEditor } = useStudioEditorEntry()
</script>

<template>
  <UButton
    v-if="showEditContent"
    variant="soft"
    color="primary"
    size="sm"
    icon="i-lucide-pencil"
    :label="label"
    class="px-2"
    @click="openEditor"
  />
</template>
