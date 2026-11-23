<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const {
  variant = 'primary',
  size = 'default',
  disabled = false,
} = defineProps<{
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'default' | 'large'
  disabled?: boolean
}>()

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()
</script>

<template>
  <button
    v-bind="$attrs"
    class="base-button" :class="[
      `base-button--${variant}`,
      size !== 'default' && `base-button--${size}`,
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--button-padding-y) var(--button-padding-x);
  border: var(--button-border-width) solid transparent;
  border-radius: var(--button-border-radius);
  font-size: var(--button-font-size);
  font-weight: var(--button-font-weight);
  cursor: pointer;
  transition: all var(--button-transition);
  text-decoration: none;
  user-select: none;
}

.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-button--primary {
  background-color: var(--button-primary-bg);
  color: var(--button-primary-text);
  border-color: var(--button-primary-border);
}

.base-button--primary:hover:not(:disabled) {
  background-color: var(--button-primary-bg-hover);
}

.base-button--primary:active:not(:disabled) {
  background-color: var(--button-primary-bg-active);
}

.base-button--secondary {
  background-color: var(--button-secondary-bg);
  color: var(--button-secondary-text);
  border-color: var(--button-secondary-border);
}

.base-button--secondary:hover:not(:disabled) {
  background-color: var(--button-secondary-bg-hover);
}

.base-button--secondary:active:not(:disabled) {
  background-color: var(--button-secondary-bg-active);
}

.base-button--danger {
  background-color: var(--button-danger-bg);
  color: var(--button-danger-text);
  border-color: var(--button-danger-border);
}

.base-button--danger:hover:not(:disabled) {
  background-color: var(--button-danger-bg-hover);
}

.base-button--danger:active:not(:disabled) {
  background-color: var(--button-danger-bg-active);
}

/* Size variants */
.base-button--small {
  padding: var(--space-1_5) var(--space-3);
  font-size: var(--font-size-xs);
}

.base-button--large {
  padding: var(--space-3) var(--space-6);
  font-size: var(--font-size-base);
}
</style>
