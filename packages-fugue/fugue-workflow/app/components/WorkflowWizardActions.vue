<script setup lang="ts">
import type { ActionConfig, EffectState, StepConfig } from '#orchestrator'

const props = withDefaults(defineProps<{
  currentStep?: StepConfig
  showBack: boolean
  isBusy: boolean
  effects: Record<string, EffectState>
  advance: () => Promise<void>
  back: () => void
  runAction: (actionId: string) => Promise<void>
  /** When false, omit the top border (e.g. sticky footer wrapper owns it). */
  bordered?: boolean
}>(), {
  currentStep: undefined,
  bordered: true,
})

const stepActions = computed(() => props.currentStep?.interactions.actions ?? [])

const showContinue = computed(() =>
  stepActions.value.length === 0 && (props.currentStep?.interactions.inputs?.length ?? 0) > 0,
)

function actionEffectKey(action: ActionConfig): string | undefined {
  if (action.effect === 'mutate' && action.handler)
    return `mutate:${action.handler}`
  if (action.effect === 'fetch' && action.handler)
    return `fetch:${action.handler}`
  return undefined
}

function isActionLoading(action: ActionConfig): boolean {
  const key = actionEffectKey(action)
  if (!key)
    return false
  return props.effects[key]?.status === 'loading'
}

function isActionDisabled(action: ActionConfig): boolean {
  return props.isBusy || isActionLoading(action)
}
</script>

<template>
  <div
    class="flex flex-wrap items-center justify-between gap-3"
    :class="bordered ? 'pt-4 border-t border-default' : ''"
  >
    <UButton
      v-if="showBack"
      label="Back"
      color="neutral"
      variant="subtle"
      icon="i-lucide-arrow-left"
      :disabled="isBusy"
      @click="back"
    />
    <div v-else />

    <div class="flex flex-wrap items-center gap-3 ms-auto">
      <UButton
        v-if="showContinue"
        label="Continue"
        color="primary"
        trailing-icon="i-lucide-arrow-right"
        :disabled="isBusy"
        :loading="isBusy"
        @click="advance"
      />

      <UButton
        v-for="action in stepActions"
        :key="action.id"
        :label="action.label"
        color="primary"
        trailing-icon="i-lucide-rocket"
        :disabled="isActionDisabled(action)"
        :loading="isActionLoading(action)"
        @click="runAction(action.id)"
      />
    </div>
  </div>
</template>
