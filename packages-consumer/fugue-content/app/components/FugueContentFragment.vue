<script setup lang="ts">
const {
  slug,
  prose = true,
} = defineProps<{
  /** Fragment file stem — e.g. `app-demo` for `content/{locale}/fragments/app-demo.md` */
  slug: string
  /** Typography scale for rendered markdown — matches landing section body text */
  prose?: boolean
}>()
const { fragment, contentId, error, loading } = useFugueContentFragment(() => slug)
const { canEdit } = useFugueContentStudioEdit()
</script>

<template>
  <div class="fugue-content-fragment flex flex-col gap-2">
    <div
      v-if="canEdit"
      class="flex justify-end"
    >
      <FugueContentEditContent
        :fragment-slug="slug"
        :require-session="false"
      />
    </div>
    <div
      v-if="loading"
      :data-content-id="contentId"
      class="text-muted"
      aria-busy="true"
    />
    <div
      v-else-if="error"
      class="rounded-lg border border-error/30 bg-error/5 p-4 text-sm text-muted"
    >
      Failed to load content fragment.
    </div>
    <div
      v-else-if="!fragment"
      class="rounded-lg border border-dashed border-muted/40 p-4 text-sm text-muted"
    >
      Fragment not found: <code>{{ slug }}</code>
    </div>
    <!-- ContentRenderer adds data-content-id in dev/preview — do not duplicate on a wrapper -->
    <div
      v-else
      :data-content-id="contentId"
      :class="prose ? 'prose prose-lg max-w-none text-muted md:prose-xl' : undefined"
    >
      <ContentRenderer :value="fragment" />
    </div>
  </div>
</template>
