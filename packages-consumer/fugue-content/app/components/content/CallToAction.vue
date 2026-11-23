<script setup lang="ts">
const {
  label,
  to,
  variant = 'primary',
} = defineProps<{
  /** Used when the markdown block has no body. Body text wins when both are set. */
  label?: string
  to: string
  variant?: 'primary' | 'neutral'
}>()

const slots = useSlots()
const { localePath } = useFugueContentI18n()

const href = computed(() => localePath(to))
</script>

<template>
  <div class="py-0">
    <UButton
      :to="href"
      :label="slots.default ? undefined : label"
      :variant="variant === 'neutral' ? 'outline' : 'solid'"
      :color="variant === 'neutral' ? 'neutral' : 'primary'"
      size="lg"
    >
      <MDCSlot
        v-if="slots.default"
        :use="slots.default"
        unwrap="p"
      />
    </UButton>
  </div>
</template>
