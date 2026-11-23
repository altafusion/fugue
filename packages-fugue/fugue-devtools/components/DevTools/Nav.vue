<script setup lang="ts">
import type { DevToolsPanelPosition } from '@altafusion/fugue-devtools-persist'

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
}>()

const dockOptions: { pos: DevToolsPanelPosition, icon: string, label: string }[] = [
  { pos: 'top', icon: 'i-lucide-panel-top', label: 'Dock top' },
  { pos: 'right', icon: 'i-lucide-panel-right', label: 'Dock right' },
  { pos: 'bottom', icon: 'i-lucide-panel-bottom', label: 'Dock bottom' },
  { pos: 'left', icon: 'i-lucide-panel-left', label: 'Dock left' },
]
</script>

<template>
  <div class="devtools-panel__nav">
    <div class="flex shrink-0 items-center gap-x-1">
      <span class="devtools-panel__brand">
        <slot name="brand">
          {{ brand }}
        </slot>
      </span>
      <UButton
        v-if="showSettingsToggle"
        icon="i-lucide-settings"
        color="primary"
        variant="ghost"
        size="xs"
        aria-label="Toggle dev tools settings"
        @click="emit('settingsToggle')"
      />
    </div>

    <div class="flex shrink-0 items-center gap-x-0.5">
      <UButton
        v-for="{ pos, icon, label } in dockOptions"
        :key="pos"
        :icon="icon"
        :color="panelPosition === pos ? 'primary' : 'neutral'"
        variant="ghost"
        size="xs"
        :aria-label="`Position panel ${pos}`"
        :title="label"
        @click="emit('positionChange', pos)"
      />
      <UButton
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        size="xs"
        data-testid="devtools-panel-close"
        aria-label="Close dev tools"
        title="Close"
        @click="emit('close')"
      />
    </div>
  </div>
</template>
