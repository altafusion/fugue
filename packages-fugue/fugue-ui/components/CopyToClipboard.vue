<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useClipboard } from '@vueuse/core'

/**
 * Copyable label — Nuxt UI port of `UI/src/components/content/CopyToClipboard.tsx`.
 *
 * Uses `useClipboard`, `UButton` (link), and `UBadge` (success).
 * For icon-only / table actions, prefer `useClipboard()` + `useToast()` directly.
 *
 * @see https://ui.nuxt.com/docs/components/input#with-copy-button
 */
const {
  content,
  label,
  class: className,
  labelClass,
  truncate = true,
  reverseIcon = false,
  nestInsideLink = false,
} = defineProps<{
  content: string
  label?: string
  class?: HTMLAttributes['class']
  labelClass?: HTMLAttributes['class']
  truncate?: boolean
  reverseIcon?: boolean
  nestInsideLink?: boolean
}>()

const displayLabel = computed(() => (label ?? content).trim())

const { copy, copied } = useClipboard({ copiedDuring: 2000 })

const iconName = computed(() =>
  copied.value ? 'i-lucide-copy-check' : 'i-lucide-copy',
)

function handleActivate(event: Event) {
  event.preventDefault()
  event.stopPropagation()
  if (!content)
    return
  void copy(content)
}
</script>

<template>
  <UButton
    :as="nestInsideLink ? 'span' : 'button'"
    variant="link"
    color="primary"
    size="xs"
    class="max-w-full min-w-0"
    :class="className"
    :ui="{ base: 'gap-1 justify-start p-0 h-auto min-h-0 font-normal' }"
    @click="handleActivate"
  >
    <UIcon
      v-if="reverseIcon"
      :name="iconName"
      class="size-4 shrink-0"
      :class="copied ? 'text-success' : ''"
    />

    <span
      class="relative isolate min-w-0 flex-1 overflow-hidden text-left"
    >
      <span
        class="relative z-0 block w-full min-w-0 transition-opacity duration-150"
        :class="[
          labelClass,
          truncate ? 'truncate' : 'break-all',
          copied ? 'text-muted/30 opacity-40' : '',
        ]"
      >
        {{ displayLabel }}
      </span>

      <span
        v-if="copied"
        class="pointer-events-none absolute inset-0 z-10 flex items-center"
      >
        <UBadge
          color="success"
          variant="soft"
          size="xs"
          label="Copied!"
          class="shadow-sm"
        />
      </span>
    </span>

    <UIcon
      v-if="!reverseIcon"
      :name="iconName"
      class="size-4 shrink-0"
      :class="copied ? 'text-success' : ''"
    />

    <span class="sr-only" aria-live="polite">
      {{ copied ? 'Copied to clipboard' : '' }}
    </span>
  </UButton>
</template>
