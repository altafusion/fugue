<script setup lang="ts">
import type { DevToolsPanelPosition } from '#devtools/persist'
import { DEVTOOLS_LAYER_CLASSES } from '#devtools/utils/devtoolsLayers'

const {
  brand = 'Dev Tools',
  panelPosition,
  showSettingsToggle = true,
} = defineProps<{
  brand?: string
  panelPosition: DevToolsPanelPosition
  showSettingsToggle?: boolean
}>()

const emit = defineEmits<{
  positionChange: [pos: DevToolsPanelPosition]
  settingsToggle: []
  close: []
  turnOff: []
}>()

const dockOptions: { pos: DevToolsPanelPosition, icon: string, label: string }[] = [
  { pos: 'top', icon: 'i-lucide-panel-top', label: 'Dock top' },
  { pos: 'right', icon: 'i-lucide-panel-right', label: 'Dock right' },
  { pos: 'bottom', icon: 'i-lucide-panel-bottom', label: 'Dock bottom' },
  { pos: 'left', icon: 'i-lucide-panel-left', label: 'Dock left' },
]

// The tooltip theme sets no z-index of its own, so without this the tooltip would open underneath the drawer.
const tooltipUi = { content: DEVTOOLS_LAYER_CLASSES.menu }
</script>

<template>
  <div class="devtools-panel__nav">
    <div class="flex shrink-0 items-center gap-x-1">
      <span class="devtools-panel__brand">
        <slot name="brand">
          {{ brand }}
        </slot>
      </span>
      <UTooltip
        v-if="showSettingsToggle"
        text="Toggle dev tools settings"
        :ui="tooltipUi"
      >
        <UButton
          icon="i-lucide-settings"
          color="primary"
          variant="ghost"
          size="xs"
          aria-label="Toggle dev tools settings"
          @click="emit('settingsToggle')"
        />
      </UTooltip>
    </div>

    <div class="flex shrink-0 items-center gap-x-0.5">
      <UTooltip
        text="Turn off Devtools"
        :ui="tooltipUi"
      >
        <UButton
          icon="i-lucide-circle-off"
          color="neutral"
          variant="ghost"
          size="xs"
          data-testid="devtools-panel-turn-off"
          aria-label="Turn off dev tools"
          @click="emit('turnOff')"
        />
      </UTooltip>
      <UTooltip
        v-for="{ pos, icon, label } in dockOptions"
        :key="pos"
        :text="label"
        :ui="tooltipUi"
      >
        <UButton
          :icon="icon"
          :color="panelPosition === pos ? 'primary' : 'neutral'"
          variant="ghost"
          size="xs"
          :aria-label="`Position panel ${pos}`"
          @click="emit('positionChange', pos)"
        />
      </UTooltip>
      <UTooltip
        text="Close"
        :ui="tooltipUi"
      >
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="xs"
          data-testid="devtools-panel-close"
          aria-label="Close dev tools"
          @click="emit('close')"
        />
      </UTooltip>
    </div>
  </div>
</template>
