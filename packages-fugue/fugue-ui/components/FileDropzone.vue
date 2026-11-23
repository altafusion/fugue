<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { FileRejection } from './fileDropzone.shared'
import {
  formatFileSize,
  toAcceptAttribute,
  validateFile,
} from './fileDropzone.shared'

/**
 * Generic drag-and-drop file picker with extension and size constraints.
 *
 * Emits `reject` when a picked file fails validation and leaves the model as it was;
 * the consumer owns both the error copy and whether the previous pick survives.
 * `invalid` only controls the error border — no message is rendered here.
 */
const {
  accept,
  maxSize,
  disabled = false,
  busy = false,
  invalid = false,
  label = 'Drag and drop a file here, or click to browse',
  hint,
  class: className,
} = defineProps<{
  /** File **extensions** only (`.zip`, `zip`) — not media types. See `FileConstraints`. */
  accept?: string[]
  maxSize?: number
  disabled?: boolean
  /** Work is in flight — the zone is inert and shows a spinner. */
  busy?: boolean
  /** Draw the error border. The consumer owns the message. */
  invalid?: boolean
  label?: string
  hint?: string
  /** Extra classes for the zone. Accepts any Vue class binding, like Nuxt UI's `class`. */
  class?: HTMLAttributes['class']
}>()

const emit = defineEmits<{
  reject: [rejection: FileRejection]
}>()

const model = defineModel<File | null>({ default: null })

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDraggingOver = ref(false)

const isInert = computed(() => disabled || busy)

const zoneClass = computed(() => [
  // The native input is `sr-only`, so keyboard focus has to be shown on the zone.
  // A ring rather than a border keeps the invalid state visible while focused.
  'relative rounded-lg border-2 border-dashed transition-colors focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary',
  isInert.value ? 'opacity-50' : 'hover:bg-elevated',
  isDraggingOver.value && !isInert.value
    ? 'border-primary bg-elevated'
    : invalid
      ? 'border-error'
      : 'border-muted',
  className,
])

const pickerClass = computed(() => [
  'flex w-full flex-col items-center justify-center gap-2 p-8',
  isInert.value ? 'cursor-not-allowed' : 'cursor-pointer',
])

function resetInput() {
  if (fileInputRef.value)
    fileInputRef.value.value = ''
}

function handleFile(file: File | null) {
  if (isInert.value)
    return

  if (!file) {
    model.value = null
    resetInput()
    return
  }

  const rejection = validateFile(file, { accept, maxSize })
  if (rejection) {
    // The model is left alone on purpose: a bad pick reports itself and the consumer
    // decides whether the previous valid file survives it. Clearing here would also
    // emit `update:model-value(null)` at a controlled parent that is already resetting.
    emit('reject', rejection)
    resetInput()
    return
  }

  model.value = file
  resetInput()
}

function onInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  handleFile(file)
}

// The default is cancelled even while inert: a drop the browser handles itself opens
// the file in the tab, replacing the app. `drop` only fires when `dragover` was
// cancelled, so both have to prevent it regardless of whether the file is accepted.
function onDragOver(event: DragEvent) {
  event.preventDefault()
  if (isInert.value)
    return
  isDraggingOver.value = true
}

function onDragEnter(event: DragEvent) {
  event.preventDefault()
  if (isInert.value)
    return
  isDraggingOver.value = true
}

function onDragLeave(event: DragEvent) {
  // `dragleave` also fires when the pointer crosses onto a child, which would
  // drop the highlight while the file is still over the zone.
  const zone = event.currentTarget as HTMLElement | null
  const enteredNode = event.relatedTarget as Node | null
  if (zone && enteredNode && zone.contains(enteredNode))
    return

  isDraggingOver.value = false
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  if (isInert.value)
    return
  isDraggingOver.value = false
  const file = event.dataTransfer?.files?.[0] ?? null
  handleFile(file)
}

function clearSelection() {
  handleFile(null)
  // This button unmounts with the selection it clears, which would drop focus to the
  // body. The input is always mounted, so hand focus back there — the zone's
  // focus-within ring then shows where the user is.
  fileInputRef.value?.focus()
}
</script>

<template>
  <div
    :class="zoneClass"
    @dragover="onDragOver"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <label :class="pickerClass">
      <input
        ref="fileInputRef"
        type="file"
        class="sr-only"
        :accept="toAcceptAttribute(accept)"
        :disabled="isInert"
        @change="onInputChange"
      >

      <template v-if="busy">
        <UIcon
          name="i-lucide-loader-circle"
          class="size-8 animate-spin text-muted"
        />
        <!-- Keep the pick on screen while work runs; the drag prompt would be stale. -->
        <template v-if="model">
          <span class="max-w-full truncate text-sm font-medium text-default">
            {{ model.name }}
          </span>
          <span class="text-sm text-muted">
            {{ formatFileSize(model.size) }}
          </span>
        </template>
        <span
          v-else
          class="text-sm text-muted"
        >{{ label }}</span>
      </template>

      <template v-else-if="model">
        <span class="max-w-full truncate text-sm font-medium text-default">
          {{ model.name }}
        </span>
        <span class="text-sm text-muted">
          {{ formatFileSize(model.size) }}
        </span>
      </template>

      <template v-else>
        <UIcon
          name="i-lucide-file"
          class="size-8 text-muted"
        />
        <span class="text-center text-sm text-default">{{ label }}</span>
        <span
          v-if="hint"
          class="text-center text-xs text-muted"
        >
          {{ hint }}
        </span>
      </template>
    </label>

    <UButton
      v-if="model && !isInert"
      variant="ghost"
      icon="i-lucide-x"
      size="xs"
      aria-label="Clear selection"
      class="absolute right-2 top-2"
      @click="clearSelection"
    />
  </div>
</template>
