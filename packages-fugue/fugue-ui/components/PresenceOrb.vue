<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

type PresenceOrbTone = 'success' | 'info' | 'warning' | 'error' | 'neutral'
type PresenceOrbSize = 'sm' | 'md'

/**
 * Generic animated status dot — domain-free presence indicator.
 * Pair with visible text; this element is decorative (`aria-hidden`).
 */
const {
  tone = 'neutral',
  pulse = false,
  size = 'md',
  class: className,
} = defineProps<{
  tone?: PresenceOrbTone
  pulse?: boolean
  size?: PresenceOrbSize
  class?: HTMLAttributes['class']
}>()

/** Dot fills use `bg-current`, so tone is a text token — `bg-muted` and friends are surfaces, too pale for a dot. */
const TONE_TEXT_CLASS: Record<PresenceOrbTone, string> = {
  success: 'text-success',
  info: 'text-info',
  warning: 'text-warning',
  error: 'text-error',
  neutral: 'text-dimmed',
}

const SIZE_CLASS: Record<PresenceOrbSize, string> = {
  sm: 'size-2',
  md: 'size-2.5',
}

const toneClass = computed(() => TONE_TEXT_CLASS[tone])
const sizeClass = computed(() => SIZE_CLASS[size])
</script>

<template>
  <span
    class="relative inline-flex shrink-0"
    :class="[sizeClass, toneClass, className]"
    aria-hidden="true"
  >
    <span
      v-if="pulse"
      class="absolute inline-flex h-full w-full animate-ping motion-reduce:animate-none rounded-full bg-current opacity-60"
    />
    <span
      class="relative inline-flex h-full w-full rounded-full bg-current"
    />
  </span>
</template>
