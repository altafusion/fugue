<script setup lang="ts">
const props = defineProps<{
  title: string
  description?: string
  actionLabel?: string
  actionTo?: string
}>()

const { localePath } = useFugueContentI18n()

const actionHref = computed(() => props.actionTo ? localePath(props.actionTo) : undefined)
</script>

<template>
  <section class="flex flex-col gap-4 py-8 sm:py-12">
    <h1 class="text-4xl font-bold tracking-tight text-highlighted sm:text-5xl">
      {{ title }}
    </h1>
    <p
      v-if="description"
      class="max-w-2xl text-lg text-muted"
    >
      {{ description }}
    </p>
    <slot />
    <UButton
      v-if="actionLabel && actionHref"
      :to="actionHref"
      :label="actionLabel"
      size="lg"
      class="self-start"
    />
  </section>
</template>
