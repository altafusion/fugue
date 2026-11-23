<script setup lang="ts">
const {
  logo,
  alt,
  size = 28,
  logoClass,
} = defineProps<{
  logo?: string
  alt?: string
  size?: number
  /** Extra classes on the logo `<img>` — from `app.config.brand.logoClass` or per-use override. */
  logoClass?: string
}>()
</script>

<template>
  <img
    v-if="logo"
    :src="logo"
    :alt="alt"
    :width="size"
    :height="size"
    class="shrink-0 rounded-lg object-contain"
    :class="logoClass"
  >
</template>
