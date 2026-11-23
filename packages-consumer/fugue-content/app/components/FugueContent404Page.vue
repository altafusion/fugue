<script setup lang="ts">
import { FUGUE_CONTENT_404_DEFAULTS, resolveFugueContent404Copy } from '../../lib/404-defaults';

const props = defineProps<{
  statusCode?: number
  title?: string
  description?: string
  actionLabel?: string
  actionTo?: string
}>()

const { localePath, t } = useShellI18n()

const copy = computed(() => resolveFugueContent404Copy(t))
const statusCode = computed(() => props.statusCode ?? FUGUE_CONTENT_404_DEFAULTS.statusCode)
const title = computed(() => props.title ?? copy.value.title)
const description = computed(() => props.description ?? copy.value.description)
const actionLabel = computed(() => props.actionLabel ?? copy.value.actionLabel)
const actionTo = computed(() => props.actionTo ?? FUGUE_CONTENT_404_DEFAULTS.actionTo)

const homeHref = computed(() => localePath(actionTo.value))
</script>

<template>
  <section
    class="flex flex-col items-center gap-4 py-8 mt-18 sm:py-12"
    aria-labelledby="fugue-content-404-title"
  >
    <!-- <p class="text-sm font-medium uppercase tracking-wide text-muted">
      {{ statusCode }}
    </p> -->
    <h1
      id="fugue-content-404-title"
      class="text-4xl font-bold tracking-tight text-highlighted sm:text-5xl"
    >
      {{ title }}
    </h1>
    <p class="max-w-2xl text-lg text-muted">
      {{ description }}
    </p>
    <UButton
      :to="homeHref"
      :label="actionLabel"
      size="lg"
      class="self-center"
    />
  </section>
</template>
