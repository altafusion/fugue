<script setup lang="ts">
const { contentPage, error, loading } = useFugueContentCatchAllRoute()
</script>

<template>
  <div
    v-if="error"
    class="p-6 text-muted"
  >
    <p>Failed to load content.</p>
  </div>
  <div
    v-else-if="loading"
    class="p-6 text-muted"
    aria-busy="true"
  />
  <FugueContent404Page v-else-if="!contentPage" />
  <FugueContentLayoutArticleAside
    v-else-if="contentPage.layout === 'article-aside'"
    :page="contentPage"
  >
    <ContentRenderer :value="contentPage" />
  </FugueContentLayoutArticleAside>
  <FugueContentLayoutArticle
    v-else-if="contentPage.layout === 'article'"
    :stem="typeof contentPage.stem === 'string' ? contentPage.stem : undefined"
  >
    <ContentRenderer :value="contentPage" />
  </FugueContentLayoutArticle>
  <FugueContentLayoutLanding v-else>
    <ContentRenderer :value="contentPage" />
  </FugueContentLayoutLanding>
</template>
