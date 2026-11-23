/**
 * Workflow Orchestrator — shared contract (POC).
 *
 * This file is the single source of truth every POC milestone binds to.
 * The engine is DOMAIN-FREE: it references handlers by name only. All deploy
 * behavior lives in a per-flow handler registry (see `~/registry`).
 *
 * Conceptual docs: content/docs/6.workflow-orchestrator/*
 */
import type { TileInlineHint } from '@altafusion/fugue-ui/components/tileSelector.shared'
import type { Component, ComputedRef, Ref } from 'vue'

// ── Context ────────────────────────────────────────────────────────────────

/** Shared, accumulating state — the only channel between steps. */
export type WorkflowContext = Record<string, unknown>

// ── Effects ──────────────────────────────────────────────────────────────

export type EffectKind = 'validate' | 'fetch' | 'mutate' | 'navigate'
export type EffectStatus = 'idle' | 'loading' | 'success' | 'error'

export interface EffectState {
  status: EffectStatus
  error?: string
}

/** Last failed mutate/fetch action — drives the shell banner and stepper error ring. */
export interface WorkflowActionError {
  /** Workflow step that owns the failure (overlay id when recovery navigates upstream). */
  stepId: string
  label: string
  message: string
}

/** A field's data source — an on-enter/on-change `fetch` effect. */
export interface FetchSource {
  effect: 'fetch'
  /** Registry `loader` id. */
  handler: string
}

// ── Interactions: inputs ─────────────────────────────────────────────────

export type FieldType = 'text' | 'choice' | 'select' | 'multiselect' | 'toggle' | 'tiles' | 'keyValue' | 'composite'

/** Visual layout for `type: tiles` (mirrors fugue-ui `TileSelectorVariant`). */
export type TileVariant = 'card' | 'square' | 'pill' | 'row' | 'feature'

/** Nuxt UI `hint` on tile options — string or inline caption with semantic color. */
export type TileOptionHint = string | TileInlineHint

/** Rich option row for `type: tiles` (maps to {@link TileSelector} items). */
export interface InputOption {
  id: string
  label: string
  /** Optional group heading for tiles rendering. */
  category?: string
  /** Nuxt UI description (body copy under label / inline caption). */
  description?: string
  /** String → single-line helper on card tiles; `{ text, color? }` → caption on row/feature. */
  hint?: TileOptionHint
  icon?: string
  disabled?: boolean
}

export interface InputConfig {
  field: string
  type: FieldType
  /**
   * Field heading override. When omitted, derived from `field` via
   * `formatFieldLabel` (e.g. `authMode` → `Auth Mode`).
   */
  label?: string
  /** INPUT requirement — gates step completion. */
  required?: boolean
  choices?: string[]
  /** Labelled options for `type: tiles` (`value-key` = `id`). */
  options?: InputOption[]
  /** Visual layout for `type: tiles` (defaults to `card`). */
  variant?: TileVariant
  /** On-enter/on-change fetch of options or dependent data. */
  source?: FetchSource
  /** Registry `validator` id (a `validate` effect). */
  validate?: string
  /**
   * Pre-fills the field when Context has no value yet (draft restore wins over this).
   * Seeds step `values` only — not written to Context until the user edits or the step advances.
   */
  default?: unknown
  /** Short helper under the field label (not a validation message). */
  note?: string
  /**
   * When true, changing this field clears keys produced by downstream steps and pulls
   * the visited frontier back to the current step. Default false (leaf edits stay local).
   */
  invalidatesDownstream?: boolean
  /** Guard for conditional visibility (DSL string or registry `guard` id). */
  when?: string
  /**
   * Id of the step `groups[]` entry this field renders under. Fields without a
   * group render above all groups, outside any card.
   */
  group?: string
  /** Registry `component` id — required for `type: composite`, rejected otherwise. */
  component?: string
  /**
   * Opaque settings handed to a composite's component. The engine never reads
   * inside it; only `type: composite` may declare one.
   */
  config?: Record<string, unknown>
  /**
   * A composite's Input Contract: the Context values it needs, as
   * `componentKey: contextKey`. The engine projects exactly these and nothing
   * more, so the component names what it wants and each flow maps its own keys
   * onto it. Composite-only.
   */
  reads?: Record<string, string>
}

// ── Interactions: actions ────────────────────────────────────────────────

export interface ActionConfig {
  id: string
  label: string
  /** `mutate` (submit/write) or `fetch` (refetch); omit for a pure transition. */
  effect?: Extract<EffectKind, 'mutate' | 'fetch'>
  /** Registry `action` id. */
  handler?: string
  /** On effect error: stay on the step (default) or route to a step id. */
  // `& Record<never, never>` keeps `'stay'` in autocomplete while still allowing any step id.
  onError?: 'stay' | (string & Record<never, never>)
}

// ── Transitions ──────────────────────────────────────────────────────────

export interface TransitionConfig {
  /** Static target step id (next/branch). */
  target?: string
  /** Guard: DSL predicate string or registry `guard` id. First match wins. */
  when?: string
  /** Registry `transition` id that computes the target (may be external). */
  dynamic?: string
  /** Fire only after this event (e.g. `submit.success`). */
  on?: string
}

// ── Step + Workflow ──────────────────────────────────────────────────────

export interface StepInteractions {
  inputs?: InputConfig[]
  actions?: ActionConfig[]
  transitions: TransitionConfig[]
}

/** Per-step stepper chrome. The flow-wide `stepper` block supplies the defaults. */
export interface StepStepperConfig {
  /** Bullet label. Defaults to the step `title`. */
  label?: string
  /** Short line shown under the bullet label (UStepper item description). */
  description?: string
  /** May this bullet be clicked to jump back to the step? */
  navigable?: boolean
  /** Offer a close control that dismisses the step (overlay presentations only). */
  closable?: boolean
}

/**
 * A titled section card grouping a step's inputs. Rendered in declaration order;
 * groups with no visible inputs after `when` guards are omitted at runtime.
 */
export interface StepGroupConfig {
  id: string
  title: string
  description?: string
  /** When true, the card body starts collapsed; auto-opens when a field error appears (user may collapse again). */
  collapsed?: boolean
  /** Body layout — defaults to vertical stack; `columns` is two-up from `md`. */
  layout?: 'stack' | 'columns'
}

/** Edge a `presentation: drawer` step docks to. */
export type DrawerSide = 'left' | 'right' | 'bottom'

/** Drawer chrome, settable flow-wide and overridable per step. */
export interface DrawerConfig {
  /** Edge the drawer opens from. Defaults to `right`. */
  side?: DrawerSide
  /** Offer the relocate control so the user can re-dock at runtime. Defaults to false. */
  relocatable?: boolean
}

/**
 * A step: its own static attributes (identity, copy, gating) alongside its
 * `interactions` (behavior) and `input`/`output` contracts (data).
 */
export interface StepConfig {
  id: string
  /**
   * Route segment appended to the workflow `basePath`. Defaults to `id`.
   * Ignored for the entry step, which mounts at `basePath` itself.
   */
  slug?: string
  title: string
  instructions?: string
  /** Stepper chrome for this step; overrides the flow-wide `stepper` block. */
  stepper?: StepStepperConfig
  /** Stepper bullet vs overlay presentation. Defaults to inline. */
  presentation?: 'inline' | 'drawer' | 'modal'
  /** Drawer chrome for this step; overrides the flow-wide `drawer` block. */
  drawer?: DrawerConfig
  optional?: boolean
  /** DATA requirements — Context keys that must exist to enter (gates entry). */
  requires?: string[]
  /** Input Contract — Context keys projected in (informational for POC). */
  input?: { from: string[] }
  interactions: StepInteractions
  /** Output Contract — Context keys this step produces. */
  output?: { produces: string[] }
  /** Step-body footer (below fields, above action buttons — not inside the action row). */
  footer?: {
    note?: string
  }
  /** Section cards for this step's body, in render order. */
  groups?: StepGroupConfig[]
}

export type RecipeContextKind = 'template' | 'snapshot'

export interface LoadFromRecipeOptions {
  kind?: RecipeContextKind
  /** Step id to navigate to instead of `config.entry`. */
  landOn?: string
}

export interface WorkflowConfig {
  workflow: string
  version: number
  entry: string
  /** Route prefix the flow mounts at (e.g. `/deploy`); one dynamic page serves all steps. */
  basePath: string
  context?: {
    globals?: string[]
    persist?: 'draft' | true | false
  }
  /** Named Context snapshots the user can save and load into a new run. */
  recipes?: {
    enabled?: boolean
    /** Context keys to omit from user-saved templates (run-specific handles, re-injected globals). */
    excludeKeys?: string[]
    /** Context keys to omit when hydrating from a snapshot of an existing entity. */
    snapshotExcludeKeys?: string[]
  }
  stepper?: {
    /** Default for every step's `stepper.navigable` (clicking a visited bullet). Default false. */
    navigable?: boolean
    /** Default for every step's `stepper.closable`. Default false. */
    closable?: boolean
    /** Step display/validation order: transition graph (default) or literal steps array. */
    order?: 'transition' | 'array'
  }
  /** Flow-wide defaults for every `presentation: drawer` step. */
  drawer?: DrawerConfig
  ui?: {
    /** Pin step actions to the viewport bottom. Default true. */
    stickyFooter?: boolean
  }
  steps: StepConfig[]
}

// ── Handler registry (imperative escape hatch) ───────────────────────────

export type LoaderFn = (ctx: WorkflowContext) => Promise<unknown> | unknown
export type ValidatorFn = (
  value: unknown,
  ctx: WorkflowContext,
) => Promise<string | null> | string | null
export type ActionFn = (
  ctx: WorkflowContext,
) => Promise<Partial<WorkflowContext>> | Partial<WorkflowContext>
export type GuardFn = (ctx: WorkflowContext) => boolean
export type TransitionFn = (ctx: WorkflowContext) => string
export type MapperFn = (ctx: WorkflowContext) => WorkflowContext

export interface HandlerRegistry {
  loaders?: Record<string, LoaderFn>
  validators?: Record<string, ValidatorFn>
  actions?: Record<string, ActionFn>
  guards?: Record<string, GuardFn>
  transitions?: Record<string, TransitionFn>
  mappers?: Record<string, MapperFn>
  /**
   * Components backing `type: composite` inputs, by the id their `component:` names.
   *
   * A composite owns an interaction the engine deliberately does not model — a
   * multi-call session, or a cluster of fields that load from each other. The
   * engine mounts it and reads back only value, readiness and error; see the
   * `Composite` props/emits contract the UI layer binds to.
   */
  components?: Record<string, Component>
}

// ── Engine composable return (bound by the UI layer) ─────────────────────

export interface UseWorkflowOptions {
  config: WorkflowConfig
  registry: HandlerRegistry
  /** Read-only values injected into Context (e.g. user, projectId). */
  globals?: WorkflowContext
}

export interface WorkflowStepListItem {
  id: string
  label: string
  description?: string
}

export interface UseWorkflowReturn {
  /** Ordered stepper items derived from the workflow config. */
  steps: ComputedRef<WorkflowStepListItem[]>
  /** The step matched to the current route, or the entry step. */
  currentStep: ComputedRef<StepConfig | undefined>
  /** Inputs visible on the current step after applying `when` guards. */
  visibleInputs: ComputedRef<InputConfig[]>
  context: Ref<WorkflowContext>
  /** Field values for the current step. */
  values: Ref<WorkflowContext>
  /** Per-field validation messages. */
  fieldErrors: Ref<Record<string, string | undefined>>
  /** True after Continue was blocked — drives required-field messages under inputs. */
  showValidation: Ref<boolean>
  /** Per-effect async state, keyed by an effect id (e.g. `fetch:fetchGroups`). */
  effects: Ref<Record<string, EffectState>>
  /** Last action failure for shell banner + stepper highlight; cleared on edit or retry. */
  actionError: Ref<WorkflowActionError | null>
  /** Per-field option lists loaded by a `fetch` source, keyed by field. */
  fieldOptions: Ref<Record<string, unknown[]>>
  /** Whether input requirements for the current step are met. */
  canComplete: ComputedRef<boolean>
  /** Overall busy flag derived from `effects`. */
  isBusy: ComputedRef<boolean>
  /** Like `isBusy`, but excludes pending `validate:` effects so text inputs stay focusable. */
  isInputBusy: ComputedRef<boolean>
  /**
   * Step ids the user may click to navigate — the completed frontier (every step up to the
   * furthest reached, minus the current one). Empty when `stepper.navigable` is off.
   */
  navigableStepIds: ComputedRef<string[]>
  /** Furthest derived-order step index reached this session (completed frontier). */
  maxVisitedIndex: Readonly<Ref<number>>

  setValue: (field: string, value: unknown) => void
  /**
   * Report whether a `composite` field's interaction has settled. Composites can
   * hold a value that isn't usable yet (a half-finished upload session), so
   * readiness — not emptiness — is what gates their step.
   */
  setCompositeReady: (field: string, ready: boolean) => void
  /** Surface a field-level message from outside the `validate` effect (composites). */
  setFieldError: (field: string, error: string | undefined) => void
  runAction: (actionId: string) => Promise<void>
  /** Resolve + follow the first satisfied transition of the current step. */
  advance: () => Promise<void>
  back: () => void
  /** Navigate directly to a step by id (stepper jump-back; entry `requires` still apply). */
  goToStep: (stepId: string) => Promise<void>
  /** Clear persisted Context and step-local engine state (e.g. on workflow exit). */
  reset: () => void
  /** Start a new run from a saved recipe — reset, merge Context, route to entry or `landOn`. */
  loadFromRecipe: (recipeContext: WorkflowContext, options?: LoadFromRecipeOptions) => Promise<void>
  /** Context plus any uncommitted values on the current step (for recipe save). */
  snapshotContext: () => WorkflowContext
}
