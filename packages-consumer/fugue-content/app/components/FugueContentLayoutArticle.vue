<script setup lang="ts">
defineProps<{
  stem?: string
}>()

const { canEdit } = useFugueContentStudioEdit()
</script>

<template>
  <article class="prose prose-neutral dark:prose-invert mx-auto w-full max-w-3xl">
    <div
      v-if="canEdit && stem"
      class="mb-4 flex justify-end"
    >
      <FugueContentEditContent
        :page-stem="stem"
        :require-session="false"
      />
    </div>
    <slot />
  </article>
</template>
