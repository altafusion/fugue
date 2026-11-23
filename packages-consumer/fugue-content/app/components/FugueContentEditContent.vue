<script setup lang="ts">
import { FUGUE_CONTENT_ARTICLE_DEFAULTS, FUGUE_CONTENT_ARTICLE_I18N_KEYS } from '../../lib/article-i18n'

const {
  pageStem,
  fragmentSlug,
  requireSession = true,
} = defineProps<{
  /** Open a routed page markdown file in Studio (e.g. `policies`). */
  pageStem?: string
  /** Open a fragment markdown file in Studio (e.g. `activities`). */
  fragmentSlug?: string
  /**
   * When true (default), hide until signed in — use on inline content chrome.
   * Footer chrome sets false so anonymous users route through `/login`.
   */
  requireSession?: boolean
}>()

const { handleEditEntry } = useFugueContentStudioEditorEntry()
const { page } = useFugueContentPage()
const { canEdit, editPage, editFragment } = useFugueContentStudioEdit()
const { t } = useShellI18n()

const editLabel = computed(() =>
  t(FUGUE_CONTENT_ARTICLE_I18N_KEYS.editPage, FUGUE_CONTENT_ARTICLE_DEFAULTS.editPage),
)

const routedPageStem = computed(() => {
  const layout = page.value?.layout
  if (layout !== 'article' && layout !== 'article-aside')
    return ''
  const stem = page.value?.stem
  return typeof stem === 'string' ? stem : ''
})

const visible = computed(() => !requireSession || canEdit.value)

async function onEdit() {
  if (fragmentSlug) {
    if (canEdit.value)
      await editFragment(fragmentSlug)
    else
      await handleEditEntry()
    return
  }

  const stem = pageStem ?? routedPageStem.value
  if (stem) {
    if (canEdit.value)
      await editPage(stem)
    else
      await handleEditEntry()
    return
  }

  await handleEditEntry()
}
</script>

<template>
  <UButton
    v-if="visible"
    variant="outline"
    color="neutral"
    size="xs"
    icon="i-lucide-edit-2"
    :label="editLabel"
    class="group px-2"
    :ui="{
      base: 'bg-transparent border border-default/50 text-muted hover:bg-transparent hover:text-primary hover:border-primary/70 active:bg-transparent active:text-primary active:border-primary focus-visible:bg-transparent transition-colors duration-200',
      leadingIcon: 'size-3.5 opacity-80 transition-colors group-hover:text-primary group-hover:opacity-100',
    }"
    @click="onEdit"
  />
</template>
