<script setup lang="ts">
import type { StudioDraftSummary } from '../../lib/qe-tools'

/**
 * The Studio drafts section of the dev tools drawer: the UI over `window.qeTools.studioDrafts`. List the unpublished drafts
 * kept in this browser, delete one, delete every draft whose key contains some text, or clear them all. Studio keeps a merged
 * copy in memory, so the page has to reload after a delete.
 */
const drafts = ref<StudioDraftSummary[]>([])
const match = ref('')
const loading = ref(false)
const confirmClear = ref(false)
const message = ref('')
const error = ref('')
const changed = ref(false)

async function run(task: (api: NonNullable<Window['qeTools']>['studioDrafts']) => Promise<string>) {
  const api = window.qeTools?.studioDrafts
  if (!api) {
    error.value = 'qeTools.studioDrafts is not available in this browser.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    message.value = await task(api)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
    confirmClear.value = false
  }
}

const refresh = () => run(async (api) => {
  drafts.value = await api.list()
  return ''
})

const remove = (key: string) => run(async (api) => {
  await api.deleteOne(key)
  changed.value = true
  drafts.value = await api.list()
  return `Deleted ${key}.`
})

const removeMatching = () => run(async (api) => {
  const text = match.value.trim()
  const removed = await api.deleteMatching(text)
  changed.value = changed.value || removed.length > 0
  drafts.value = await api.list()
  return `Deleted ${removed.length} draft(s) matching "${text}".`
})

const clearAll = () => run(async (api) => {
  const before = drafts.value.length
  await api.clearAll()
  changed.value = true
  drafts.value = await api.list()
  return `Cleared all drafts (${before} listed before).`
})

const reload = () => window.location.reload()

// A transparent card with the stronger `accented` border, so it reads on the drawer's solid background.
const cardUi = { root: 'bg-transparent ring-accented', header: 'px-3 py-2 sm:px-3', body: 'p-3 sm:p-3' }

onMounted(refresh)
</script>

<template>
  <div class="grid w-full gap-4 text-sm sm:grid-cols-2">
    <UCard :ui="cardUi">
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <span class="font-medium">Actions</span>
          <UBadge
            :label="`${drafts.length} in this browser`"
            size="sm"
            color="neutral"
            variant="subtle"
          />
        </div>
      </template>

      <div class="space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <UButton
            label="Refresh"
            icon="i-lucide-refresh-cw"
            size="xs"
            color="neutral"
            variant="outline"
            :loading="loading"
            @click="refresh"
          />
          <UButton
            v-if="!confirmClear"
            label="Clear All Drafts"
            icon="i-lucide-eraser"
            size="xs"
            color="error"
            variant="outline"
            :disabled="loading || !drafts.length"
            @click="confirmClear = true"
          />
          <template v-else>
            <UButton
              label="Yes, Clear Everything"
              icon="i-lucide-triangle-alert"
              size="xs"
              color="error"
              :loading="loading"
              @click="clearAll"
            />
            <UButton
              label="Cancel"
              size="xs"
              color="neutral"
              variant="ghost"
              @click="confirmClear = false"
            />
          </template>
        </div>

        <form @submit.prevent="removeMatching">
          <UFieldGroup class="w-full">
            <UInput
              v-model="match"
              placeholder="Text in the draft key, e.g. about"
              size="xs"
              class="flex-1"
            />
            <UButton
              type="submit"
              label="Delete Matching"
              icon="i-lucide-trash-2"
              size="xs"
              color="warning"
              variant="outline"
              :disabled="!match.trim()"
              :loading="loading"
            />
          </UFieldGroup>
        </form>

        <UAlert
          v-if="message"
          :description="message"
          color="neutral"
          variant="subtle"
          icon="i-lucide-info"
        />
        <UAlert
          v-if="error"
          :description="error"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
        />

        <UButton
          v-if="changed"
          label="Reload Page To Apply"
          icon="i-lucide-rotate-cw"
          size="xs"
          @click="reload"
        />
      </div>
    </UCard>

    <UCard :ui="cardUi">
      <template #header>
        <span class="font-medium">Drafts</span>
      </template>

      <ul
        v-if="drafts.length"
        class="max-h-40 divide-y divide-default overflow-y-auto"
      >
        <li
          v-for="draft in drafts"
          :key="draft.key"
          class="flex items-center justify-between gap-2 py-1"
        >
          <span class="truncate font-mono text-xs">{{ draft.key }}</span>
          <span class="flex shrink-0 items-center gap-1">
            <UBadge
              :label="draft.status"
              size="sm"
              color="neutral"
              variant="subtle"
            />
            <UButton
              label="Delete"
              size="xs"
              color="error"
              variant="ghost"
              :disabled="loading"
              @click="remove(draft.key)"
            />
          </span>
        </li>
      </ul>
      <UEmpty
        v-else
        icon="i-lucide-inbox"
        title="No Drafts"
        description="Unpublished Studio edits in this browser show up here."
        size="sm"
        variant="naked"
      />
    </UCard>
  </div>
</template>
