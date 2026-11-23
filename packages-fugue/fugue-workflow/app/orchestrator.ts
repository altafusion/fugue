/**
 * Public API of the Workflow Orchestrator engine.
 *
 * Consumers (e.g. the deploy layer) import ONLY from `#orchestrator` — never from
 * `engine/*` or `types/*` directly. This barrel is the curated, domain-free contract.
 *
 * Engine internals stay unexported on purpose: the zod schema (`workflowSchema`),
 * the title-case validator (`titleCase`), the guard DSL (`evaluateGuard`),
 * and the step/transition resolvers (`resolveStep`, `resolveTransition`) are
 * implementation details of `loadWorkflow` / `useWorkflow`. Add a symbol here only
 * when it is genuinely part of the public contract.
 */

// ── Runtime entry points ─────────────────────────────────────────────────
export { RecoverableActionError } from './engine/actionRecovery'
export { DEFAULT_DRAWER_SIDE, resolveDrawerConfig } from './engine/drawerPresentation'
export type { ResolvedDrawerConfig } from './engine/drawerPresentation'
export { loadWorkflow, safeLoadWorkflow } from './engine/loadWorkflow'
export type { SafeLoadWorkflowFailure, SafeLoadWorkflowResult, SafeLoadWorkflowSuccess } from './engine/loadWorkflow'
export { deriveStepOrder } from './engine/orderSteps'
export { sanitizeRecipeContext } from './engine/recipeContext'
export { localStorageRecipeRepository, LocalStorageRecipeRepository } from './engine/recipeRepository'
export { resolveStepperHighlightStepId } from './engine/resolveStepperHighlightStepId'
export {
  isPathOwnedByWorkflow,
  resolveWorkflowEntry,
  resolveWorkflowFromSources,
  resolveWorkflowKey,
  resolveWorkflowKeyFromResult,
} from './engine/resolveWorkflow'
// ── Catalog types ────────────────────────────────────────────────────────
export type {
  ResolveWorkflowError,
  ResolveWorkflowResult,
  ResolveWorkflowSuccess,
  WorkflowCatalog,
  WorkflowEntry,
  WorkflowLoadFailure,
} from './engine/resolveWorkflow'
export { stepHasRenderableContent, stepShouldWarnEmpty } from './engine/stepContent'
export { resolveStepperConfig } from './engine/stepperConfig'
export type { ResolvedStepperConfig } from './engine/stepperConfig'
export { getStepPresentation, isOverlayStepPresentation, missingRequiredInputs, useWorkflow } from './engine/useWorkflow'
export type { StepPresentation } from './engine/useWorkflow'
export { useWorkflowContext } from './engine/useWorkflowContext'
// ── Context store types ──────────────────────────────────────────────────
export type { UseWorkflowContextOptions, WorkflowContextStore } from './engine/useWorkflowContext'
export { useWorkflowRecipes } from './engine/useWorkflowRecipes'
export type { UseWorkflowRecipesReturn } from './engine/useWorkflowRecipes'

export { DRAWER_SIDES, FIELD_TYPES, TILE_VARIANTS } from './engine/workflowSchema'

export type { Recipe, RecipeRepository, RecipeWrite } from './types/recipe'

export type { LoadFromRecipeOptions, RecipeContextKind } from './types/workflow'
// ── Contract types ───────────────────────────────────────────────────────
export type {
  ActionConfig,
  ActionFn,
  DrawerConfig,
  DrawerSide,
  EffectKind,
  EffectState,
  EffectStatus,
  FetchSource,
  FieldType,
  GuardFn,
  HandlerRegistry,
  InputConfig,
  InputOption,
  LoaderFn,
  MapperFn,
  StepConfig,
  StepGroupConfig,
  StepInteractions,
  StepStepperConfig,
  TileVariant,
  TransitionConfig,
  TransitionFn,
  UseWorkflowOptions,
  UseWorkflowReturn,
  ValidatorFn,
  WorkflowActionError,
  WorkflowConfig,
  WorkflowContext,
  WorkflowStepListItem,
} from './types/workflow'
