<script setup lang="ts">
import type { Component } from 'vue'
import type { EffectState, InputConfig, WorkflowContext } from '#orchestrator'

const props = withDefaults(defineProps<{
  inputs: InputConfig[]
  values: WorkflowContext
  fieldErrors: Record<string, string | undefined>
  fieldOptions: Record<string, unknown[]>
  effects: Record<string, EffectState>
  isBusy: boolean
  /** Components backing `type: composite` inputs, keyed by registry id. */
  components?: Record<string, Component>
  compositeContexts: Record<string, Record<string, unknown> | undefined>
  layout?: 'stack' | 'columns'
}>(), {
  layout: 'stack',
})

const emit = defineEmits<{
  update: [field: string, value: unknown]
  ready: [field: string, ready: boolean]
  error: [field: string, error: string | undefined]
}>()

const wrapperClass = computed(() => {
  if (props.layout === 'columns')
    return 'grid grid-cols-1 md:grid-cols-2 gap-6 items-start [&>*:only-child]:md:col-span-2'

  return 'space-y-6'
})
</script>

<template>
  <div :class="wrapperClass">
    <WorkflowWizardField
      v-for="input in inputs"
      :key="input.field"
      :input="input"
      :model-value="values[input.field]"
      :error="fieldErrors[input.field]"
      :options="fieldOptions[input.field]"
      :effects="effects"
      :is-busy="isBusy"
      :component="input.component ? components?.[input.component] : undefined"
      :composite-context="compositeContexts[input.field]"
      @update:model-value="(value) => emit('update', input.field, value)"
      @update:ready="(ready) => emit('ready', input.field, ready)"
      @update:error="(message) => emit('error', input.field, message)"
    />
  </div>
</template>
