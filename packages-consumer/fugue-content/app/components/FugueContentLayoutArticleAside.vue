<script setup lang="ts">
import type { FugueContentPage } from '../composables/useFugueContentPage'
import { FUGUE_CONTENT_ARTICLE_DEFAULTS, FUGUE_CONTENT_ARTICLE_I18N_KEYS } from '../../lib/article-i18n'
import { fugueContentPageTocLinks } from '../../lib/page-toc'

const props = defineProps<{
  page: FugueContentPage
}>()

const { t } = useShellI18n()
const { canEdit } = useFugueContentStudioEdit()

const tocLinks = computed(() => fugueContentPageTocLinks(props.page.body))

const tocTitle = computed(() =>
  t(FUGUE_CONTENT_ARTICLE_I18N_KEYS.onThisPage, FUGUE_CONTENT_ARTICLE_DEFAULTS.onThisPage),
)

const stem = computed(() => {
  const value = props.page.stem
  return typeof value === 'string' ? value : ''
})
</script>

<template>
  <UContainer class="py-8">
    <!-- self-start on #right grid cell — stretch was blocking sticky float -->
    <UPage :ui="{ right: 'lg:self-start' }">
      <UPageBody>
        <details
          v-if="tocLinks.length"
          class="fugue-content-article-aside__mobile-toc lg:hidden"
        >
          <summary class="cursor-pointer text-sm font-medium text-highlighted">
            {{ tocTitle }}
          </summary>
          <UContentToc
            :links="tocLinks"
            class="mt-3"
          />
        </details>

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
      </UPageBody>

      <template
        v-if="tocLinks.length"
        #right
      >
        <UPageAside
          :ui="{
            root: 'lg:sticky lg:top-[calc(var(--shell-header-height,2.5rem)+1px)] lg:self-start lg:overflow-visible lg:max-h-none',
          }"
        >
          <UContentToc
            :links="tocLinks"
            :title="tocTitle"
            highlight
            class="hidden lg:block"
            :ui="{
              root: 'lg:static lg:top-auto lg:overflow-visible lg:max-h-none',
            }"
          />
        </UPageAside>
      </template>
    </UPage>
  </UContainer>
</template>

<style scoped>
.fugue-content-article-aside__mobile-toc {
  margin-bottom: var(--space-6, 1.5rem);
  border: 1px solid var(--color-border, rgb(255 255 255 / 0.12));
  border-radius: var(--radius-lg, 0.5rem);
  padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
}
</style>
