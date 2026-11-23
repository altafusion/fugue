<script setup lang="ts">
/**
 * Lightbulb hint on a tile title. Opens on hover/focus via {@link UTooltip}.
 * Stops pointer events so the parent radio/checkbox does not change selection.
 */
const { text, label } = defineProps<{
  text: string
  /** Used for the trigger aria-label. */
  label?: string
}>()
</script>

<template>
  <span
    class="flex shrink-0 items-center leading-none"
    @pointerdown.stop
  >
    <UTooltip
      :text="text"
      :delay-duration="0"
      :content="{ side: 'bottom' }"
    >
      <button
        type="button"
        class="inline-flex size-4 shrink-0 items-center justify-center leading-none text-muted hover:text-default"
        :aria-label="label ? `More about ${label}` : 'More information'"
        @click.stop
      >
        <UIcon
          name="i-lucide-lightbulb"
          class="size-3.5"
          aria-hidden="true"
        />
      </button>
    </UTooltip>
  </span>
</template>
