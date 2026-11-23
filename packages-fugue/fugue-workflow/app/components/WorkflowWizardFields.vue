<script setup lang="ts">
import type { Component } from 'vue'
import type { EffectState, InputConfig, StepGroupConfig, WorkflowContext } from '#orchestrator'
import { applyGroupErrorAutoOpen } from '../utils/groupErrorAutoOpen'
import { partitionInputGroups } from '../utils/partitionInputGroups'
import { projectCompositeReads } from '../utils/projectCompositeReads'

const props = withDefaults(defineProps<{
  inputs?: InputConfig[]
  groups?: StepGroupConfig[]
  values: WorkflowContext
  /** Full Context, projected per composite via its `reads` contract. */
  context: WorkflowContext
  fieldErrors: Record<string, string | undefined>
  fieldOptions: Record<string, unknown[]>
  effects: Record<string, EffectState>
  isBusy: boolean
  /** Components backing `type: composite` inputs, keyed by registry id. */
  components?: Record<string, Component>
}>(), {
  inputs: undefined,
  groups: undefined,
  components: undefined,
})

const emit = defineEmits<{
  update: [field: string, value: unknown]
  ready: [field: string, ready: boolean]
  error: [field: string, error: string | undefined]
}>()

const partitioned = computed(() => partitionInputGroups(props.inputs ?? [], props.groups))

const compositeContexts = computed(() => Object.fromEntries(
  (props.inputs ?? []).map(input => [
    input.field,
    projectCompositeReads(input, props.context),
  ]),
))

const groupOpenById = ref<Record<string, boolean>>({})
const groupHadErrorById = ref<Record<string, boolean>>({})

watch(
  () => partitioned.value.groups.map(({ group, inputs: groupInputs }) => ({
    id: group.id,
    collapsed: Boolean(group.collapsed),
    hasError: groupInputs.some(input => Boolean(props.fieldErrors[input.field])),
  })),
  (groups) => {
    const result = applyGroupErrorAutoOpen(
      groups,
      groupOpenById.value,
      groupHadErrorById.value,
    )
    groupOpenById.value = result.openById
    groupHadErrorById.value = result.hadErrorById
  },
  { immediate: true },
)

function isGroupOpen(group: StepGroupConfig): boolean {
  if (!group.collapsed)
    return true
  return groupOpenById.value[group.id] ?? false
}

function setGroupOpen(groupId: string, open: boolean) {
  groupOpenById.value = { ...groupOpenById.value, [groupId]: open }
}
</script>

<template>
  <div v-if="inputs?.length" class="space-y-6">
    <WorkflowWizardFieldList
      v-if="partitioned.ungrouped.length"
      :inputs="partitioned.ungrouped"
      :values="values"
      :field-errors="fieldErrors"
      :field-options="fieldOptions"
      :effects="effects"
      :is-busy="isBusy"
      :components="components"
      :composite-contexts="compositeContexts"
      @update="(field, value) => emit('update', field, value)"
      @ready="(field, ready) => emit('ready', field, ready)"
      @error="(field, message) => emit('error', field, message)"
    />

    <UCard
      v-for="{ group, inputs: groupInputs } in partitioned.groups"
      :key="group.id"
      variant="outline"
    >
      <UCollapsible
        v-if="group.collapsed"
        :open="isGroupOpen(group)"
        :unmount-on-hide="false"
        class="flex flex-col gap-6"
        @update:open="(open) => setGroupOpen(group.id, open)"
      >
        <template #default="{ open }">
          <button
            type="button"
            class="flex w-full items-start justify-between gap-3 text-left"
          >
            <div class="min-w-0">
              <span class="text-base font-semibold text-highlighted">
                {{ group.title }}
              </span>
              <span
                v-if="group.description"
                class="mt-1 block text-sm text-muted"
              >
                {{ group.description }}
              </span>
            </div>
            <UIcon
              :name="open ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
              class="mt-0.5 size-4 shrink-0 text-muted"
            />
          </button>
        </template>

        <template #content>
          <WorkflowWizardFieldList
            :inputs="groupInputs"
            :layout="group.layout"
            :values="values"
            :field-errors="fieldErrors"
            :field-options="fieldOptions"
            :effects="effects"
            :is-busy="isBusy"
            :components="components"
            :composite-contexts="compositeContexts"
            @update="(field, value) => emit('update', field, value)"
            @ready="(field, ready) => emit('ready', field, ready)"
            @error="(field, message) => emit('error', field, message)"
          />
        </template>
      </UCollapsible>

      <template v-else>
        <div class="space-y-6">
          <div>
            <h2 class="text-base font-semibold text-highlighted">
              {{ group.title }}
            </h2>
            <p
              v-if="group.description"
              class="mt-1 text-sm text-muted"
            >
              {{ group.description }}
            </p>
          </div>

          <WorkflowWizardFieldList
            :inputs="groupInputs"
            :layout="group.layout"
            :values="values"
            :field-errors="fieldErrors"
            :field-options="fieldOptions"
            :effects="effects"
            :is-busy="isBusy"
            :components="components"
            :composite-contexts="compositeContexts"
            @update="(field, value) => emit('update', field, value)"
            @ready="(field, ready) => emit('ready', field, ready)"
            @error="(field, message) => emit('error', field, message)"
          />
        </div>
      </template>
    </UCard>
  </div>
</template>
