<script setup lang="ts">
import type { StudioDraftSummary } from '../../lib/qe-tools'

/** The Studio drafts section of the dev tools drawer: the UI over `window.qeTools.studioDrafts`. */
const drafts = ref<StudioDraftSummary[]>([])
const loading = ref(false)
const error = ref('')

async function refresh() {
  const api = window.qeTools?.studioDrafts
  if (!api)
    return
  loading.value = true
  error.value = ''
  try {
    drafts.value = await api.list()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

async function remove(key: string) {
  await window.qeTools?.studioDrafts.deleteOne(key)
  await refresh()
}

onMounted(refresh)
</script>

<template>
  <div class="space-y-2 text-sm">
    <div class="flex items-center justify-between">
      <span class="text-muted">{{ drafts.length }} draft(s) in this browser</span>
      <UButton
        label="Refresh"
        size="xs"
        color="neutral"
        variant="ghost"
        :loading="loading"
        @click="refresh"
      />
    </div>
    <p
      v-if="error"
      class="text-error"
    >
      {{ error }}
    </p>
    <ul class="divide-y divide-default">
      <li
        v-for="draft in drafts"
        :key="draft.key"
        class="flex items-center justify-between gap-2 py-1"
      >
        <span class="truncate font-mono text-xs">{{ draft.key }}</span>
        <UButton
          label="Delete"
          size="xs"
          color="error"
          variant="ghost"
          @click="remove(draft.key)"
        />
      </li>
    </ul>
    <p class="text-xs text-muted">
      After deleting, hard refresh the page.
    </p>
  </div>
</template>
