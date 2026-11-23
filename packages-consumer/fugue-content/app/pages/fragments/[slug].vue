<script setup lang="ts">
const route = useRoute()

const slug = computed(() => {
  const param = route.params.slug
  const raw = typeof param === 'string' ? param : param?.[0]
  return raw ?? ''
})

const { fragment } = useFugueContentFragment(slug)

/** Studio preview route for embed-only fragments — not linked in app nav. */
definePageMeta({ layout: 'default' })

useFugueContentSiteSeo({
  title: () => fragment.value?.title,
  description: () => fragment.value?.description,
})
</script>

<template>
  <div class="mx-auto max-w-3xl py-8">
    <FugueContentFragment :slug="slug" />
  </div>
</template>
