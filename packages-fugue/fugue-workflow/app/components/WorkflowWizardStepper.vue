<script setup lang="ts">
import {
  WIZARD_STEPPER_ACTIVE_TRIGGER,
  WIZARD_STEPPER_ERROR_TRIGGER,
} from '../theme'

const props = withDefaults(defineProps<{
  steps: { id: string, label: string, description?: string }[]
  currentStepId?: string
  /** Step ids the user may click to navigate (the completed frontier). */
  navigableStepIds?: string[]
  /** Stepper bullet to ring when an action failed on this step (or its overlay child). */
  errorStepId?: string
  /** Merged into `UStepper` slot classes. */
  ui?: Record<string, string>
}>(), {
  currentStepId: undefined,
  navigableStepIds: undefined,
  errorStepId: undefined,
  ui: undefined,
})

const emit = defineEmits<{
  select: [stepId: string]
}>()

const stripRef = ref<HTMLElement | null>(null)

const activeStep = computed(() => props.currentStepId ?? props.steps[0]?.id)
const navigableSet = computed(() => new Set(props.navigableStepIds ?? []))
const currentIndex = computed(() => props.steps.findIndex(step => step.id === activeStep.value))

// Three tones for the visited region (default grey/disabled beyond the frontier):
//  • active      — the current step: solid fill + a same-color halo ring so it stands out.
//  • completed   — visited and BEHIND the current step: solid fill (theme "completed" state).
//  • left-behind — visited but AHEAD of the current step (clicked away from): Reka renders
//                  these in its grey "inactive" state, so re-color to the fill + dim opacity.
const ACTIVE_TRIGGER = WIZARD_STEPPER_ACTIVE_TRIGGER
const ERROR_TRIGGER = WIZARD_STEPPER_ERROR_TRIGGER
const COMPLETED_TRIGGER = 'cursor-pointer'
const LEFT_BEHIND_TRIGGER = 'cursor-pointer bg-primary text-inverted opacity-50'

const items = computed(() =>
  props.steps.map((step, index) => {
    const isActive = step.id === activeStep.value
    const clickable = navigableSet.value.has(step.id)
    const hasError = step.id === props.errorStepId

    let trigger: string | undefined
    if (hasError) {
      if (isActive) {
        trigger = ERROR_TRIGGER
      } else if (clickable) {
        const base = index < currentIndex.value
          ? COMPLETED_TRIGGER
          : LEFT_BEHIND_TRIGGER
        trigger = `${base} ${ERROR_TRIGGER}`
      } else {
        trigger = ERROR_TRIGGER
      }
    } else if (isActive) {
      trigger = ACTIVE_TRIGGER
    } else if (clickable) {
      trigger = index < currentIndex.value
        ? COMPLETED_TRIGGER
        : LEFT_BEHIND_TRIGGER
    }

    return {
      title: step.label,
      description: step.description,
      value: step.id,
      disabled: !clickable && !isActive,
      ui: trigger
        ? { trigger }
        : undefined,
    }
  }),
)

/**
 * Below `md` (phones): fixed step widths + horizontal strip scroll.
 * `md+` (iPad / desktop): equal `w-full` distribution — no horizontal scroll.
 */
const stepperUi = computed(() => ({
  header: ['flex w-max min-w-full md:w-full', props.ui?.header].filter(Boolean).join(' '),
  item: ['group text-center relative w-36 shrink-0 sm:w-40 md:w-full md:min-w-0 md:shrink', props.ui?.item].filter(Boolean).join(' '),
  title: ['font-medium text-default truncate', props.ui?.title].filter(Boolean).join(' '),
  description: ['text-muted truncate md:whitespace-normal md:text-wrap', props.ui?.description].filter(Boolean).join(' '),
  ...Object.fromEntries(
    Object.entries(props.ui ?? {}).filter(([key]) => ![
      'header',
      'item',
      'title',
      'description',
    ].includes(key)),
  ),
}))

function onSelect(value: string | number | undefined): void {
  if (typeof value === 'string' && value !== activeStep.value)
    emit('select', value)
}

watch(activeStep, () => {
  if (typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches)
    return
  const container = stripRef.value
  const active = container?.querySelector<HTMLElement>('[data-state="active"]')
  if (!container || !active)
    return
  const containerRect = container.getBoundingClientRect()
  const activeRect = active.getBoundingClientRect()
  const scrollLeft = container.scrollLeft + activeRect.left - containerRect.left
    - (containerRect.width / 2) + (activeRect.width / 2)
  container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
}, { immediate: true, flush: 'post' })
</script>

<template>
  <!--
    Horizontal scroll only below `md`. iPad+ fills the row with equal-width steps
    so neither the page nor the strip scrolls sideways.
  -->
  <div
    ref="stripRef"
    class="min-w-0 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] md:overflow-x-visible"
  >
    <UStepper
      :model-value="activeStep"
      value-key="value"
      :items="items"
      :linear="false"
      class="w-max min-w-full md:w-full"
      :ui="stepperUi"
      @update:model-value="onSelect"
    />
  </div>
</template>
