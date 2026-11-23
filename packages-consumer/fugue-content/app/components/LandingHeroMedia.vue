<script setup lang="ts">
import type { Component } from 'vue'
import FugueContentFragment from './FugueContentFragment.vue'

const {
  src,
  alt,
  slug,
  contentComponent,
  mobileHeight = 'h-48',
  desktopMinHeight = 'min-h-48',
  objectFit = 'cover',
  loading = 'eager',
} = defineProps<{
  /** Public path to the hero image — e.g. `/assets/img/hero.jpg` */
  src: string
  alt: string
  /** Fragment stem for slot content when `contentComponent` is omitted */
  slug?: string
  /** Registered Vue component name for slot content (app-specific heroes) */
  contentComponent?: string
  /** Tailwind height utility for the mobile banner */
  mobileHeight?: string
  /** Tailwind min-height utility for the desktop banner wrapper */
  desktopMinHeight?: string
  objectFit?: 'cover' | 'contain'
  loading?: 'eager' | 'lazy'
}>()

const objectFitClass = computed(() =>
  objectFit === 'contain' ? 'object-contain' : 'object-cover',
)

const mobileImageClass = computed(() =>
  [mobileHeight, 'w-full', objectFitClass.value].join(' '),
)

const desktopImageClass = computed(() =>
  ['h-full w-full object-center', objectFitClass.value].join(' '),
)

function resolveNamedComponent(name: string): Component | string {
  const registered = useNuxtApp().vueApp.component(name)
  if (registered)
    return registered as Component
  return resolveComponent(name)
}

const resolvedContentComponent = computed(() =>
  contentComponent ? resolveNamedComponent(contentComponent) : null,
)
</script>

<template>
  <div class="landing-hero-media">
    <div class="landing-hero-media__banner landing-hero-media__banner--mobile md:hidden">
      <img
        :src="src"
        :alt="alt"
        :class="mobileImageClass"
        :loading="loading"
      >
    </div>

    <div
      v-if="resolvedContentComponent || slug"
      class="landing-hero-media__content"
    >
      <component
        :is="resolvedContentComponent"
        v-if="resolvedContentComponent"
      />
      <FugueContentFragment
        v-else-if="slug"
        :slug="slug"
      />
    </div>

    <div
      class="landing-hero-media__banner landing-hero-media__banner--desktop hidden md:block"
      :class="desktopMinHeight"
    >
      <img
        :src="src"
        :alt="alt"
        :class="desktopImageClass"
        :loading="loading"
      >
    </div>
  </div>
</template>
