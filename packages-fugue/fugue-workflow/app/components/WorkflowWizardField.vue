<script setup lang="ts">
import type { Component } from 'vue'
import type { EffectState, InputConfig } from '#orchestrator'
import { WIZARD_FIELD_TILE_RING_BASE } from '../theme'
import { formatFieldLabel, resolveInputLabel } from '../utils/formatFieldLabel'

const props = defineProps<{
  input: InputConfig
  modelValue: unknown
  error?: string
  /** Options loaded by the field's `fetch` source, if any. */
  options?: unknown[]
  effects: Record<string, EffectState>
  isBusy: boolean
  /** Resolved component for `type: composite` — looked up from the flow registry. */
  component?: Component
  /** Context values a composite declared via `reads`, keyed as the component named them. */
  compositeContext?: Record<string, unknown>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
  'update:ready': [ready: boolean]
  'update:error': [error: string | undefined]
}>()

function resolveSelectItems(): { label: string, value: string }[] {
  if (props.input.choices?.length) {
    return props.input.choices.map(value => ({
      label: formatFieldLabel(value),
      value,
    }))
  }

  if (Array.isArray(props.options)) {
    return props.options.flatMap((option) => {
      if (option !== null && typeof option === 'object') {
        const record = option as Record<string, unknown>
        const value = record.value ?? record.id
        if (value === null || value === undefined)
          return []
        const label = record.label ?? record.name ?? formatFieldLabel(String(value))
        return [
          {
            label: String(label),
            value: String(value),
          },
        ]
      }
      const value = String(option)
      return [
        {
          label: formatFieldLabel(value),
          value,
        },
      ]
    })
  }

  return []
}

const fetchEffectKey = computed(() =>
  props.input.source?.handler
    ? `fetch:${props.input.source.handler}`
    : undefined,
)

const isFetching = computed(() => {
  if (!fetchEffectKey.value)
    return false
  return props.effects[fetchEffectKey.value]?.status === 'loading'
})

const fetchError = computed(() => {
  if (!fetchEffectKey.value)
    return undefined
  return props.effects[fetchEffectKey.value]?.error
})

const choiceItems = computed(() => resolveSelectItems())

function mapTileOption(option: NonNullable<InputConfig['options']>[number]) {
  const hint = option.hint
  const inlineHint = hint && typeof hint === 'object'
    ? hint
    : undefined
  const stringHint = typeof hint === 'string'
    ? hint
    : undefined
  // Pill: string `hint` is the lightbulb tooltip (title + tip). Other variants keep
  // string hint as description body; object hint stays an inline caption.
  const pillTooltip = props.input.variant === 'pill'
    ? stringHint
    : undefined

  return {
    id: option.id,
    label: option.label,
    description: option.description ?? (pillTooltip ? undefined : stringHint),
    hint: inlineHint,
    tooltip: pillTooltip,
    icon: option.icon,
    disabled: option.disabled,
  }
}

const tileItems = computed(() =>
  (props.input.options ?? []).map(mapTileOption),
)

const hasTileCategories = computed(() =>
  (props.input.options ?? []).some(option => Boolean(option.category)),
)

const tileGroups = computed(() => {
  const tileOptions = props.input.options ?? []
  const uncategorized: ReturnType<typeof mapTileOption>[] = []
  const groupMap = new Map<string, ReturnType<typeof mapTileOption>[]>()
  const groupOrder: string[] = []

  for (const option of tileOptions) {
    const item = mapTileOption(option)
    if (option.category) {
      if (!groupMap.has(option.category)) {
        groupMap.set(option.category, [])
        groupOrder.push(option.category)
      }
      groupMap.get(option.category)!.push(item)
    } else {
      uncategorized.push(item)
    }
  }

  const groups = groupOrder.map(category => ({
    category,
    items: groupMap.get(category)!,
  }))

  if (uncategorized.length > 0) {
    const existingOther = groups.find(g => g.category === 'Other')
    if (existingOther)
      existingOther.items.push(...uncategorized)
    else
      groups.push({ category: 'Other', items: uncategorized })
  }

  return groups
})

const selectItems = computed(() => choiceItems.value)

const multiselectValue = computed({
  get(): string[] {
    if (!Array.isArray(props.modelValue))
      return []
    return props.modelValue.map(value => String(value))
  },
  set(value: string[]) {
    emit('update:modelValue', value)
  },
})

const fieldValue = computed({
  get(): string | undefined {
    if (Array.isArray(props.modelValue))
      return undefined
    if (props.modelValue === null || props.modelValue === undefined)
      return undefined
    return String(props.modelValue)
  },
  set(value: string | undefined) {
    emit('update:modelValue', value === '' || value === undefined
      ? undefined
      : value)
  },
})

const textValue = computed({
  get(): string {
    if (props.modelValue === null || props.modelValue === undefined)
      return ''
    return String(props.modelValue)
  },
  set(value: string) {
    emit('update:modelValue', value)
  },
})

const toggleValue = computed({
  get() {
    // Coerce stringified booleans (e.g. from persisted/untyped Context) so `'false'` reads as off.
    if (typeof props.modelValue === 'string')
      return props.modelValue === 'true'
    return Boolean(props.modelValue)
  },
  set(value: boolean) {
    emit('update:modelValue', value)
  },
})

const fieldLabel = computed(() =>
  resolveInputLabel(props.input.field, props.input.label),
)

const fieldHighlighted = computed(() => Boolean(props.error))

/** Error state uses Nuxt `color="error"` so tile `highlight` rings red, not primary. */
const tileColor = computed(() => (props.error ? 'error' : 'primary'))

/**
 * Always reserve ring + padding so toggling error doesn't shift layout.
 * Idle uses a transparent ring (same width as error).
 */
const tileErrorRingClass = computed(() =>
  [
    WIZARD_FIELD_TILE_RING_BASE,
    props.error ? 'ring-error' : 'ring-transparent',
  ].join(' '),
)

const tileDefaultBindings = computed(() => {
  const value = props.input.default
  if (typeof value === 'string' || typeof value === 'number') {
    return {
      defaultValue: String(value),
    }
  }
  return {}
})

function tileGroupName(category: string): string {
  return `${props.input.field}-${category}`
}
</script>

<template>
  <!-- Keep in sync with FIELD_TYPES (workflowSchema). -->
  <div class="space-y-2">
    <template v-if="input.type === 'tiles'">
      <USkeleton
        v-if="isFetching"
        class="h-32 w-full"
      />
      <template v-else-if="hasTileCategories">
        <TileGroupSection
          :title="fieldLabel"
          :note="input.note"
          :required="input.required"
        >
          <!-- Wrapper ring: tile `highlight` alone is easy to miss when nothing is selected. -->
          <div
            class="space-y-6"
            :class="tileErrorRingClass"
          >
            <TileGroupSection
              v-for="group in tileGroups"
              :key="group.category"
              as="h4"
              variant="category"
              :title="group.category"
            >
              <TileSelector
                v-model="fieldValue"
                bare
                :name="tileGroupName(group.category)"
                v-bind="tileDefaultBindings"
                :disabled="isBusy"
                value-key="id"
                :items="group.items"
                :variant="input.variant ?? 'card'"
                :color="tileColor"
                :highlight="fieldHighlighted"
              />
            </TileGroupSection>
          </div>
        </TileGroupSection>
        <WorkflowSlideAlert
          class="mt-2"
          :open="Boolean(error)"
          :title="error"
          :ui="{
            root: 'py-2',
            title: 'text-sm font-normal',
            icon: 'size-4',
          }"
        />
      </template>
      <template v-else>
        <TileGroupSection
          :title="fieldLabel"
          :note="input.note"
          :required="input.required"
        >
          <div :class="tileErrorRingClass">
            <TileSelector
              v-model="fieldValue"
              bare
              :name="input.field"
              v-bind="tileDefaultBindings"
              :disabled="isBusy"
              value-key="id"
              :items="tileItems"
              :variant="input.variant ?? 'card'"
              :color="tileColor"
              :highlight="fieldHighlighted"
            />
          </div>
        </TileGroupSection>
        <WorkflowSlideAlert
          class="mt-2"
          :open="Boolean(error)"
          :title="error"
          :ui="{
            root: 'py-2',
            title: 'text-sm font-normal',
            icon: 'size-4',
          }"
        />
      </template>
    </template>

    <UFormField
      v-else
      :name="input.field"
      :label="fieldLabel"
      :description="input.note"
      :required="input.required"
      :error="error"
    >
      <template v-if="input.type === 'choice'">
        <USkeleton v-if="isFetching" class="h-10 w-full" />
        <URadioGroup
          v-else
          v-model="fieldValue"
          :items="choiceItems"
          :disabled="isBusy"
          :highlight="fieldHighlighted"
        />
      </template>

      <div v-else-if="input.type === 'select'" class="space-y-2">
        <USkeleton v-if="isFetching" class="h-10 w-full" />
        <USelect
          v-else
          v-model="fieldValue"
          :items="selectItems"
          :placeholder="`Select ${fieldLabel.toLowerCase()}`"
          :disabled="isBusy || selectItems.length === 0"
          :highlight="fieldHighlighted"
          class="w-full"
        />
      </div>

      <div v-else-if="input.type === 'multiselect'" class="space-y-2">
        <USkeleton v-if="isFetching" class="h-10 w-full" />
        <USelectMenu
          v-else
          v-model="multiselectValue"
          multiple
          value-key="value"
          :items="selectItems"
          :placeholder="`Select ${fieldLabel.toLowerCase()}`"
          :disabled="isBusy || selectItems.length === 0"
          :highlight="fieldHighlighted"
          class="w-full"
        />
      </div>

      <WorkflowWizardKeyValueField
        v-else-if="input.type === 'keyValue'"
        :model-value="modelValue"
        :disabled="isBusy"
        :highlighted="fieldHighlighted"
        @update:model-value="emit('update:modelValue', $event)"
      />

      <UInput
        v-else-if="input.type === 'text'"
        v-model="textValue"
        :disabled="isBusy"
        :highlight="fieldHighlighted"
        class="w-full"
      />

      <USwitch
        v-else-if="input.type === 'toggle'"
        v-model="toggleValue"
        :disabled="isBusy"
      />

      <!--
        Composite: the registered component owns the whole interaction. The engine
        passes its opaque `config` through, projects only the Context keys it asked
        for, and reads back value, readiness and error — never its internals.
      -->
      <component
        :is="component"
        v-else-if="input.type === 'composite' && component"
        :model-value="modelValue"
        :config="input.config"
        :context="compositeContext"
        :disabled="isBusy"
        @update:model-value="emit('update:modelValue', $event)"
        @update:ready="emit('update:ready', $event)"
        @update:error="emit('update:error', $event)"
      />

      <UAlert
        v-else
        color="warning"
        variant="subtle"
        title="Unsupported field type"
        :description="`Field '${input.field}' uses unsupported type '${input.type}'.`"
      />
    </UFormField>

    <UAlert
      v-if="fetchError"
      color="error"
      variant="subtle"
      :title="`Unable to load ${fieldLabel.toLowerCase()}`"
      :description="fetchError"
    />
  </div>
</template>
