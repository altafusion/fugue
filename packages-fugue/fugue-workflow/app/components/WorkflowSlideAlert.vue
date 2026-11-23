<script setup lang="ts">
/**
 * Slides a Nuxt `UAlert` open/closed: height (grid-rows) + translate/opacity
 * so the wizard body eases instead of jumping.
 */
const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  description?: string
  /** Forwarded to `UAlert` `ui` — compact field errors vs full shell banners. */
  ui?: Record<string, string>
  class?: string
}>(), {
  title: undefined,
  description: undefined,
  ui: undefined,
  class: undefined,
})
</script>

<template>
  <div
    class="grid transition-[grid-template-rows] duration-300 ease-out"
    :class="open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
  >
    <div class="min-h-0 overflow-hidden">
      <Transition
        enter-active-class="transition-[opacity,transform] duration-300 ease-out"
        leave-active-class="transition-[opacity,transform] duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        leave-to-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-from-class="opacity-100 translate-y-0"
      >
        <UAlert
          v-if="open && (title || description)"
          color="error"
          variant="subtle"
          icon="i-lucide-triangle-alert"
          :title="title"
          :description="description"
          :class="props.class"
          :ui="ui"
        />
      </Transition>
    </div>
  </div>
</template>
