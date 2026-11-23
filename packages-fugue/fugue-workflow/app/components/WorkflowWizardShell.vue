<script setup lang="ts">
import type { HandlerRegistry, Recipe, RecipeRepository, WorkflowCatalog, WorkflowConfig, WorkflowContext, WorkflowEntry, WorkflowLoadFailure } from '#orchestrator'
import type { WorkflowWizardChromeOverrides } from '../theme'
import type { WorkflowStepView } from '../types/workflowStepView'
import { deriveStepOrder, getStepPresentation, isOverlayStepPresentation, isPathOwnedByWorkflow, resolveDrawerConfig, resolveStepperConfig, resolveStepperHighlightStepId, stepShouldWarnEmpty, useWorkflow, useWorkflowRecipes } from '#orchestrator'
import { resolveWizardChrome, WIZARD_ROOT_CLASS } from '../theme'
import { resolveDisplayFieldErrors } from '../utils/resolveFieldDisplayError'

defineOptions({
  name: 'WorkflowWizardShell',
})

const props = withDefaults(defineProps<{
  config: WorkflowConfig
  registry: HandlerRegistry
  /** Optional workflow globals (identity, tenant ids, etc.) — product layer supplies these. */
  globals?: Record<string, unknown>
  /** Escape hatch: when set, overrides catalog-based ownership for route-leave reset. */
  isPathOwned?: (path: string, basePath: string) => boolean
  /** When `isPathOwned` is omitted, ownership defaults from catalog + failures (+ optional fallback). */
  catalog?: WorkflowCatalog
  failures?: WorkflowLoadFailure[]
  fallback?: WorkflowEntry
  /** Product name for page title / SEO (e.g. `Deploy`). */
  productLabel?: string
  /** Optional SEO description; omitted when unset. */
  seoDescription?: string
  /** Pluggable recipe store; defaults to localStorage when omitted. */
  recipeRepository?: RecipeRepository
  /** When set, hydrate from this recipe id on mount (client-only). */
  initialRecipeId?: string
  /** When set, hydrate from this Context snapshot on mount (client-only). Takes precedence over `initialRecipeId`. */
  initialSnapshot?: WorkflowContext
  /** Toast title when snapshot hydration fails on mount. */
  snapshotHydrateErrorTitle?: string
  /** Step to land on when hydrating from `initialRecipeId` or `initialSnapshot`. */
  landOn?: string
  /** When set, wraps content in `<NuxtLayout>` and places the page header in `#header`. */
  layout?: string
  /** Optional wizard chrome overrides (layout classes, stepper/drawer `ui`). */
  chrome?: Partial<WorkflowWizardChromeOverrides>
}>(), {
  globals: () => ({}),
  productLabel: 'Workflow',
  seoDescription: undefined,
  layout: undefined,
  chrome: undefined,
  snapshotHydrateErrorTitle: 'Failed to load workflow snapshot',
})

const NuxtLayoutComponent = resolveComponent('NuxtLayout')

/** Renders `#header` + default slot inline when no layout is requested (headless embed). */
const LayoutPassthrough = defineComponent({
  name: 'LayoutPassthrough',
  inheritAttrs: false,
  setup(_, { slots }) {
    return () => {
      const nodes = []
      if (slots.header) {
        const header = slots.header()
        nodes.push(...(Array.isArray(header)
          ? header
          : [header]))
      }
      if (slots.default) {
        const body = slots.default()
        nodes.push(...(Array.isArray(body)
          ? body
          : [body]))
      }
      return nodes
    }
  },
})

const workflow = useWorkflow({
  config: props.config,
  registry: props.registry,
  globals: props.globals,
})

const toast = useToast()

const recipesEnabled = computed(() => props.config.recipes?.enabled === true)

const resolvedChrome = computed(() =>
  resolveWizardChrome(props.chrome, { recipesEnabled: recipesEnabled.value }),
)

const recipeStore = useWorkflowRecipes(() => props.config.workflow, props.recipeRepository)
const recipesOpen = ref(false)
const saveRecipeOpen = ref(false)
const savingRecipe = ref(false)

const isHydrating = ref(Boolean(props.initialSnapshot || props.initialRecipeId))

onMounted(async () => {
  if (!props.initialSnapshot && !props.initialRecipeId)
    return

  try {
    if (props.initialSnapshot) {
      await workflow.loadFromRecipe(props.initialSnapshot, {
        kind: 'snapshot',
        landOn: props.landOn,
      })
    } else {
      const recipe = await recipeStore.get(props.initialRecipeId!)
      if (!recipe)
        throw new Error(`Recipe not found: ${props.initialRecipeId}`)
      await workflow.loadFromRecipe(recipe.context, {
        kind: 'snapshot',
        landOn: props.landOn,
      })
    }
  } catch (error) {
    const description = error instanceof Error
      ? error.message
      : undefined
    if (props.initialSnapshot) {
      console.error('Snapshot hydrate failed', error)
      toast.add({
        title: props.snapshotHydrateErrorTitle,
        description,
        color: 'error',
        duration: 8000,
      })
    } else {
      console.error('Recipe load failed', error)
      toast.add({
        title: 'Failed to load recipe',
        description,
        color: 'error',
        duration: 8000,
      })
    }
  } finally {
    isHydrating.value = false
  }
})

watch(recipesOpen, (open) => {
  if (open)
    void recipeStore.refresh()
})

async function handleSaveRecipe(payload: { name: string, description?: string }): Promise<void> {
  savingRecipe.value = true
  try {
    await recipeStore.save({
      name: payload.name,
      description: payload.description,
      context: workflow.snapshotContext(),
    })
    saveRecipeOpen.value = false
    toast.add({ title: 'Recipe saved', color: 'success' })
  } catch (error) {
    const description = error instanceof Error
      ? error.message
      : undefined
    console.error('Recipe save failed', error)
    toast.add({
      title: 'Failed to save recipe',
      description,
      color: 'error',
      duration: 8000,
    })
  } finally {
    savingRecipe.value = false
  }
}

async function handleLoadRecipe(recipe: Recipe): Promise<void> {
  recipesOpen.value = false
  try {
    await workflow.loadFromRecipe(recipe.context)
  } catch (error) {
    recipesOpen.value = true
    const description = error instanceof Error
      ? error.message
      : undefined
    console.error('Recipe load failed', error)
    toast.add({
      title: 'Failed to load recipe',
      description,
      color: 'error',
      duration: 8000,
    })
  }
}

async function handleRemoveRecipe(recipe: Recipe): Promise<void> {
  try {
    await recipeStore.remove(recipe.id)
  } catch {
    toast.add({ title: 'Failed to remove recipe', color: 'error' })
  }
}

const resolvePathOwnership = computed(() => {
  if (props.isPathOwned)
    return props.isPathOwned
  if (props.catalog) {
    return (path: string, basePath: string) =>
      isPathOwnedByWorkflow(path, basePath, props.catalog!, props.failures ?? [], props.fallback)
  }
  return undefined
})

onBeforeRouteLeave((to) => {
  const isPathOwned = resolvePathOwnership.value
  if (isPathOwned && !isPathOwned(to.path, props.config.basePath))
    workflow.reset()
})

const orderedSteps = computed(() => deriveStepOrder(props.config))

const entryStepIndex = computed(() => orderedSteps.value.findIndex(step => step.id === props.config.entry))

const canSaveRecipe = computed(() => {
  if (!recipesEnabled.value)
    return false
  const entryIndex = entryStepIndex.value
  if (entryIndex < 0)
    return false
  return workflow.maxVisitedIndex.value > entryIndex
})

function openSaveRecipeDialog(): void {
  if (!canSaveRecipe.value || workflow.isBusy.value)
    return
  saveRecipeOpen.value = true
}

const stickyFooter = computed(() => props.config.ui?.stickyFooter !== false)

const pageTitle = computed(() => workflow.currentStep.value?.title ?? props.productLabel)
const pageDescription = computed(() => workflow.currentStep.value?.instructions ?? '')
const currentStepId = computed(() => workflow.currentStep.value?.id)
const stepInputs = computed(() => workflow.visibleInputs.value)

const presentation = computed(() => {
  const step = workflow.currentStep.value
  return step
    ? getStepPresentation(step)
    : 'inline'
})

const isOverlayStep = computed(() => {
  const step = workflow.currentStep.value
  return step
    ? isOverlayStepPresentation(step)
    : false
})

const stepClosable = computed(() => {
  const step = workflow.currentStep.value
  return step
    ? resolveStepperConfig(props.config, step).closable
    : false
})

const drawerCloseProps = computed(() => (stepClosable.value
  ? { size: 'xs' as const }
  : false))

const drawerConfig = computed(() => resolveDrawerConfig(props.config, workflow.currentStep.value))
const {
  side: drawerSide,
  relocatable: drawerRelocatable,
  setSide: setDrawerSide,
} = useWizardDrawerSide(props.config.workflow, drawerConfig)

const stepperCurrentStepId = computed(() => {
  const current = workflow.currentStep.value
  if (!current)
    return undefined
  if (!isOverlayStepPresentation(current))
    return current.id

  const index = orderedSteps.value.findIndex(step => step.id === current.id)
  for (let i = index - 1; i >= 0; i--) {
    const step = orderedSteps.value[i]!
    if (!isOverlayStepPresentation(step))
      return step.id
  }
  return current.id
})

const overlayOpen = computed({
  get: () => isOverlayStep.value,
  set: (open: boolean) => {
    if (!open && isOverlayStep.value)
      workflow.back()
  },
})

const displayFieldErrors = computed(() =>
  resolveDisplayFieldErrors(
    stepInputs.value,
    workflow.values.value,
    workflow.fieldErrors.value,
    workflow.showValidation.value,
  ),
)

/** Error banner for body and overlay steps — action failures win over incomplete-step validation. */
const bodyErrorAlert = computed(() => {
  const action = workflow.actionError.value
  if (action) {
    return {
      title: `${action.label} failed`,
      description: action.message,
    }
  }
  if (!workflow.showValidation.value || workflow.canComplete.value)
    return undefined
  const messages = Object.values(displayFieldErrors.value).filter(
    (message): message is string => Boolean(message),
  )
  if (messages.length === 0)
    return undefined
  return {
    title: 'Missing required fields',
    description: messages.length === 1
      ? messages[0]!
      : messages.join(' · '),
  }
})

const stepperErrorStepId = computed(() => {
  const error = workflow.actionError.value
  if (error)
    return resolveStepperHighlightStepId(props.config, error.stepId)

  // Incomplete-step validation (Continue / Deploy) — ring the current inline bullet.
  if (workflow.showValidation.value && !workflow.canComplete.value && currentStepId.value)
    return resolveStepperHighlightStepId(props.config, currentStepId.value)

  return undefined
})

const shouldWarnEmpty = computed(() => {
  const step = workflow.currentStep.value
  if (!step)
    return false
  return stepShouldWarnEmpty(step, stepInputs.value)
})

useSeoMeta({
  title: () => (pageTitle.value !== props.productLabel
    ? `${props.productLabel} — ${pageTitle.value}`
    : props.productLabel),
  description: () => props.seoDescription,
})

const showBack = computed(() => {
  return currentStepId.value !== undefined && currentStepId.value !== props.config.entry
})

const stepContentProps = computed<WorkflowStepView>(() => ({
  shouldWarnEmpty: shouldWarnEmpty.value,
  stepInputs: stepInputs.value,
  values: workflow.values.value,
  context: workflow.context.value,
  fieldErrors: displayFieldErrors.value,
  fieldOptions: workflow.fieldOptions.value,
  effects: workflow.effects.value,
  components: props.registry.components,
  isBusy: workflow.isBusy.value,
  isInputBusy: workflow.isInputBusy.value,
  currentStep: workflow.currentStep.value,
  showBack: showBack.value,
  canComplete: workflow.canComplete.value,
  advance: workflow.advance,
  back: workflow.back,
  runAction: workflow.runAction,
  setValue: workflow.setValue,
  setCompositeReady: workflow.setCompositeReady,
  setFieldError: workflow.setFieldError,
  stickyFooter: stickyFooter.value,
}))
</script>

<template>
  <component
    :is="layout ? NuxtLayoutComponent : LayoutPassthrough"
    v-bind="layout ? { name: layout } : undefined"
  >
    <template #header>
      <UPageHeader
        :title="pageTitle"
        :description="pageDescription"
        :ui="resolvedChrome.pageHeaderUi"
      >
        <template
          v-if="recipesEnabled"
          #links
        >
          <UButton
            label="Save Recipe"
            color="neutral"
            variant="outline"
            icon="i-lucide-bookmark"
            :disabled="!canSaveRecipe || workflow.isBusy.value"
            @click="openSaveRecipeDialog"
          />
          <UButton
            label="Use Recipes"
            color="primary"
            variant="solid"
            icon="i-lucide-book-open"
            :disabled="workflow.isBusy.value"
            @click="recipesOpen = true"
          />
        </template>
      </UPageHeader>
    </template>

    <div :class="[WIZARD_ROOT_CLASS, resolvedChrome.shellContentColumnClass]">
      <div
        v-if="isHydrating"
        data-testid="wizard-hydrating"
      />

      <template v-else>
        <div>
          <WorkflowWizardStepper
            :steps="workflow.steps.value"
            :current-step-id="stepperCurrentStepId"
            :navigable-step-ids="workflow.navigableStepIds.value"
            :error-step-id="stepperErrorStepId"
            :ui="resolvedChrome.stepperUi"
            @select="workflow.goToStep"
          />

          <WorkflowSlideAlert
            v-if="!isOverlayStep"
            class="mt-8"
            :open="Boolean(bodyErrorAlert)"
            :title="bodyErrorAlert?.title"
            :description="bodyErrorAlert?.description"
          />
        </div>

        <UCard
          v-if="!isOverlayStep"
          class="min-w-0 overflow-x-clip"
        >
          <WorkflowWizardStepContent :view="stepContentProps" />
        </UCard>

        <WorkflowWizardDrawer
          v-else-if="presentation === 'drawer'"
          v-model:open="overlayOpen"
          :side="drawerSide"
          :title="pageTitle"
          :description="pageDescription"
          :relocatable="drawerRelocatable"
          :close="drawerCloseProps"
          :header-ui="resolvedChrome.drawerHeaderUi"
          :body-class="resolvedChrome.drawerBodyClass"
          @update:side="setDrawerSide"
        >
          <template #body>
            <WorkflowSlideAlert
              class="mb-4"
              :open="Boolean(bodyErrorAlert)"
              :title="bodyErrorAlert?.title"
              :description="bodyErrorAlert?.description"
            />
            <WorkflowWizardStepContent :view="stepContentProps" />
          </template>
        </WorkflowWizardDrawer>

        <UModal
          v-else-if="presentation === 'modal'"
          v-model:open="overlayOpen"
          :title="pageTitle"
          :dismissible="true"
          :close="stepClosable"
        >
          <template #body>
            <p
              v-if="pageDescription"
              class="text-sm text-muted mb-6"
            >
              {{ pageDescription }}
            </p>
            <WorkflowSlideAlert
              class="mb-4"
              :open="Boolean(bodyErrorAlert)"
              :title="bodyErrorAlert?.title"
              :description="bodyErrorAlert?.description"
            />
            <WorkflowWizardStepContent :view="stepContentProps" />
          </template>
        </UModal>
      </template>
    </div>
  </component>

  <WorkflowRecipesDialog
    v-if="recipesEnabled"
    v-model:open="recipesOpen"
    :recipes="recipeStore.recipes.value"
    :loading="recipeStore.loading.value"
    @load="handleLoadRecipe"
    @remove="handleRemoveRecipe"
  />

  <WorkflowSaveRecipeDialog
    v-if="recipesEnabled"
    v-model:open="saveRecipeOpen"
    :saving="savingRecipe"
    @save="handleSaveRecipe"
  />
</template>
