<script setup lang="ts">
import type { DrawerSide } from '#orchestrator'
import { DRAWER_SIDES } from '#orchestrator'

defineOptions({
  name: 'WorkflowWizardRelocate',
})

const side = defineModel<DrawerSide>('side', { required: true })

const dockOptions: { side: DrawerSide, icon: string, label: string }[] = DRAWER_SIDES.map(side => ({
  side,
  icon: `i-lucide-panel-${side}`,
  label: `Dock ${side}`,
}))
</script>

<template>
  <div class="flex items-center gap-x-0.5">
    <UButton
      v-for="option in dockOptions"
      :key="option.side"
      :icon="option.icon"
      :color="side === option.side ? 'primary' : 'neutral'"
      variant="ghost"
      size="xs"
      :aria-label="option.label"
      :title="option.label"
      :data-testid="`workflow-wizard-dock-${option.side}`"
      @click="side = option.side"
    />
  </div>
</template>
