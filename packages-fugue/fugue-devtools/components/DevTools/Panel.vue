<script setup lang="ts">
import type { DevToolsPanelPosition } from '#devtools/composables/devtoolsTypes'
import { isHorizontalDevToolsDock } from '#devtools/persist'

const {
  bodyGridClass = '',
  sectionClass = '',
} = defineProps<{
  /** Extra grid classes on the section container (e.g. 3-column bottom dock). */
  bodyGridClass?: string
  /** Extra class on sections passed through `sectionClass` slot prop. */
  sectionClass?: string
}>()

const open = defineModel<boolean>('open', { required: true })

const panelPosition = defineModel<DevToolsPanelPosition>('panelPosition', {
  required: true,
})

const direction = computed(() => panelPosition.value)

const isHorizontalDock = computed(() => isHorizontalDevToolsDock(panelPosition.value))

const drawerSurfaceClass
  = 'devtools-panel__surface--drawer !bg-muted ring-default shadow-lg drop-shadow-xl'

const drawerUi = computed(() => {
  const surface = drawerSurfaceClass
  const body = 'devtools-panel overflow-y-auto px-3 py-2'
  const container = 'gap-0'

  switch (panelPosition.value) {
    case 'left':
      return {
        content: `top-22 left-4 bottom-4 max-w-96 z-50 ${surface}`,
        body,
        container,
      }
    case 'top':
      return {
        content: `inset-x-4 top-22 max-h-[min(24rem,70vh)] sm:max-h-[min(28rem,75vh)] z-50 ${surface}`,
        body,
        container,
      }
    case 'bottom':
      return {
        content: `inset-x-4 bottom-12 max-h-[min(24rem,70vh)] sm:max-h-[min(28rem,75vh)] z-50 ${surface}`,
        body,
        container,
      }
    default:
      return {
        content: `top-22 right-4 bottom-4 max-w-96 z-50 ${surface}`,
        body,
        container,
      }
  }
})
</script>

<template>
  <UDrawer
    :key="direction"
    v-model:open="open"
    :direction="direction"
    :modal="false"
    :overlay="false"
    :dismissible="false"
    :handle="false"
    inset
    :ui="drawerUi"
  >
    <template #body>
      <slot name="nav" />

      <div class="mt-3 grid grid-cols-1 gap-4" :class="bodyGridClass">
        <slot
          :section-class="sectionClass"
          :is-bottom-dock="panelPosition === 'bottom'"
          :is-horizontal-dock="isHorizontalDock"
          :panel-position="panelPosition"
        />
      </div>
    </template>
  </UDrawer>
</template>
