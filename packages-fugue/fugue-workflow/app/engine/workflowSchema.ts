import { TILE_SEMANTIC_COLORS } from '@altafusion/fugue-ui/components/tileSelector.shared'
import { z } from 'zod'
import { isTitleCase } from './titleCase'

const effectKindSchema = z.enum([
  'validate',
  'fetch',
  'mutate',
  'navigate',
])

/** Supported input field types — single source for zod validation and UI drift tests. */
export const FIELD_TYPES = [
  'text',
  'choice',
  'select',
  'multiselect',
  'toggle',
  'tiles',
  'keyValue',
  'composite',
] as const
const fieldTypeSchema = z.enum(FIELD_TYPES)

/** Visual layouts for `type: tiles` (mirrors fugue-ui `TileSelectorVariant`). */
export const TILE_VARIANTS = [
  'card',
  'square',
  'pill',
  'row',
  'feature',
] as const
const tileVariantSchema = z.enum(TILE_VARIANTS)

const stepStepperSchema = z.object({
  label: z.string().min(1).optional(),
  description: z.string().optional(),
  navigable: z.boolean().optional(),
  closable: z.boolean().optional(),
}).strict()

/** Edges a `presentation: drawer` step can dock to (maps to `UDrawer` `direction`). */
export const DRAWER_SIDES = ['left', 'right', 'bottom'] as const
const drawerConfigSchema = z.object({
  side: z.enum(DRAWER_SIDES).optional(),
  relocatable: z.boolean().optional(),
}).strict()

const fetchSourceSchema = z.object({
  effect: z.literal('fetch'),
  handler: z.string().min(1),
}).strict()

/** Inline caption on row/feature tiles — string falls back to `description` on card tiles. */
const tileHintSchema = z.union([
  z.string().min(1),
  z.object({
    text: z.string().min(1),
    color: z.enum(TILE_SEMANTIC_COLORS).optional(),
  }).strict(),
])

const inputOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  category: z.string().optional(),
  /** Nuxt UI description (body copy). */
  description: z.string().min(1).optional(),
  /** String → card-tile helper; `{ text, color? }` → inline caption on row/feature. */
  hint: tileHintSchema.optional(),
  icon: z.string().optional(),
  disabled: z.boolean().optional(),
}).strict().superRefine((option, ctx) => {
  if (option.description !== undefined && typeof option.hint === 'string') {
    ctx.addIssue({
      code: 'custom',
      message: 'use either description or a string hint, not both',
      path: ['hint'],
    })
  }
})

const inputConfigSchema = z.object({
  field: z.string().min(1),
  type: fieldTypeSchema,
  /** Override the derived field heading (`formatFieldLabel(field)` when omitted). */
  label: z.string().min(1).optional(),
  required: z.boolean().optional(),
  choices: z.array(z.string()).optional(),
  options: z.array(inputOptionSchema).optional(),
  /** Visual layout for `type: tiles` (defaults to `card`). */
  variant: tileVariantSchema.optional(),
  source: fetchSourceSchema.optional(),
  validate: z.string().min(1).optional(),
  default: z.unknown().optional(),
  note: z.string().min(1).optional(),
  invalidatesDownstream: z.boolean().optional(),
  when: z.string().min(1).optional(),
  /** Registry `component` id for `type: composite`. */
  component: z.string().min(1).optional(),
  /** Opaque settings passed through to a composite's component. */
  config: z.record(z.string(), z.unknown()).optional(),
  /** A composite's Context projection, as `componentKey: contextKey`. */
  reads: z.record(z.string().min(1), z.string().min(1)).optional(),
  /** Id of the step `groups[]` entry this field renders under. */
  group: z.string().min(1).optional(),
}).strict().superRefine((input, ctx) => {
  if (input.variant && input.type !== 'tiles') {
    ctx.addIssue({
      code: 'custom',
      message: 'variant is only supported on tiles inputs',
      path: ['variant'],
    })
  }
  if (input.type === 'composite') {
    if (!input.component) {
      ctx.addIssue({
        code: 'custom',
        message: 'composite inputs require a component',
        path: ['component'],
      })
    }
    if (input.default !== undefined) {
      ctx.addIssue({
        code: 'custom',
        message: 'default is not supported on composite inputs',
        path: ['default'],
      })
    }
    return
  }
  // Keep the black box opt-in: these keys are meaningless without a component to
  // hand them to, and silently ignoring them would hide an authoring mistake.
  for (const key of ['component', 'config', 'reads'] as const) {
    if (input[key] !== undefined) {
      ctx.addIssue({
        code: 'custom',
        message: `${key} is only supported on composite inputs`,
        path: [key],
      })
    }
  }
  if (input.type === 'tiles') {
    if (!input.options?.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'tiles inputs require options',
      })
    }
    return
  }
  if (input.type === 'choice' || input.type === 'select' || input.type === 'multiselect') {
    if (!input.choices?.length && !input.source) {
      ctx.addIssue({
        code: 'custom',
        message: 'choice, select, and multiselect inputs require either choices or source',
      })
    }
  }
})

const actionConfigSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  effect: effectKindSchema.extract(['mutate', 'fetch']).optional(),
  handler: z.string().min(1).optional(),
  onError: z.union([
    z.literal('stay'),
    z.string().min(1),
  ]).optional(),
}).strict().refine(
  action => !action.effect || Boolean(action.handler),
  { message: 'an action with an effect ("mutate"/"fetch") requires a handler' },
)

const transitionConfigSchema = z.object({
  target: z.string().min(1).optional(),
  when: z.string().min(1).optional(),
  dynamic: z.string().min(1).optional(),
  on: z.string().min(1).optional(),
}).strict().refine(
  transition => Boolean(transition.target) || Boolean(transition.dynamic),
  { message: 'a transition must specify a "target" or a "dynamic" resolver' },
)

const stepInteractionsSchema = z.object({
  inputs: z.array(inputConfigSchema).optional(),
  actions: z.array(actionConfigSchema).optional(),
  // Optional so `array`-mode steps can rely on linear fall-through (advance to the
  // next step) without declaring any transition. Defaults to [] so downstream
  // graph/validation code always sees an array.
  transitions: z.array(transitionConfigSchema).default([]),
}).strict()

const stepGroupSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).superRefine((title, ctx) => {
    if (title.length > 0 && !isTitleCase(title)) {
      ctx.addIssue({
        code: 'custom',
        message: 'group title must use title case (capitalize major words; lowercase articles, short conjunctions, and short prepositions unless first, last, or after &)',
      })
    }
  }),
  description: z.string().optional(),
  collapsed: z.boolean().optional(),
  layout: z.enum(['stack', 'columns']).optional(),
}).strict()

const stepConfigSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1).optional(),
  title: z.string().min(1).superRefine((title, ctx) => {
    // `.min(1)` already reports emptiness; skip the title-case check on empty input
    // so we don't stack a redundant second error (Zod doesn't bail out early).
    if (title.length > 0 && !isTitleCase(title)) {
      ctx.addIssue({
        code: 'custom',
        message: 'step title must use title case (capitalize major words; lowercase articles, short conjunctions, and short prepositions unless first, last, or after &)',
      })
    }
  }),
  instructions: z.string().optional(),
  stepper: stepStepperSchema.optional(),
  presentation: z.enum(['inline', 'drawer', 'modal']).optional(),
  drawer: drawerConfigSchema.optional(),
  optional: z.boolean().optional(),
  requires: z.array(z.string().min(1)).optional(),
  input: z.object({
    from: z.array(z.string().min(1)),
  }).strict().optional(),
  interactions: stepInteractionsSchema,
  output: z.object({
    produces: z.array(z.string().min(1)),
  }).strict().optional(),
  footer: z.object({
    note: z.string().min(1),
  }).strict().optional(),
  groups: z.array(stepGroupSchema).optional(),
}).strict().superRefine((step, ctx) => {
  if (step.drawer && step.presentation !== 'drawer') {
    ctx.addIssue({
      code: 'custom',
      message: 'drawer is only supported on steps with presentation: drawer',
      path: ['drawer'],
    })
  }

  if (step.groups?.length) {
    const declaredGroupIds = new Set<string>()
    for (const [index, group] of step.groups.entries()) {
      if (declaredGroupIds.has(group.id)) {
        ctx.addIssue({
          code: 'custom',
          message: `duplicate group id "${group.id}"`,
          path: ['groups', index, 'id'],
        })
      }
      declaredGroupIds.add(group.id)
    }
  }

  const declaredGroupIds = new Set(step.groups?.map(group => group.id) ?? [])
  for (const [index, input] of (step.interactions.inputs ?? []).entries()) {
    if (input.group && !declaredGroupIds.has(input.group)) {
      ctx.addIssue({
        code: 'custom',
        message: `input references unknown group id "${input.group}"`,
        path: [
          'interactions',
          'inputs',
          index,
          'group',
        ],
      })
    }
  }
})

export const workflowConfigSchema = z.object({
  workflow: z.string().min(1),
  version: z.number().int().nonnegative(),
  entry: z.string().min(1),
  basePath: z.string().min(1).startsWith('/', 'basePath must start with "/"'),
  context: z.object({
    globals: z.array(z.string().min(1)).optional(),
    persist: z.union([
      z.literal('draft'),
      z.literal(true),
      z.literal(false),
    ]).optional(),
  }).strict().optional(),
  recipes: z.object({
    enabled: z.boolean().optional(),
    /** Context keys to omit from user-saved templates (run-specific handles, re-injected globals). */
    excludeKeys: z.array(z.string().min(1)).optional(),
    /** Context keys to omit when hydrating from a snapshot of an existing entity. */
    snapshotExcludeKeys: z.array(z.string().min(1)).optional(),
  }).strict().optional(),
  stepper: z.object({
    // Defaults for every step's own `stepper` block; a step may override either.
    navigable: z.boolean().optional(),
    closable: z.boolean().optional(),
    order: z.enum(['transition', 'array']).optional(),
  }).strict().optional(),
  drawer: drawerConfigSchema.optional(),
  ui: z.object({
    stickyFooter: z.boolean().optional(),
  }).strict().optional(),
  steps: z.array(stepConfigSchema).min(1).superRefine((steps, ctx) => {
    const seen = new Set<string>()
    for (const [index, step] of steps.entries()) {
      if (seen.has(step.id)) {
        ctx.addIssue({
          code: 'custom',
          message: `duplicate step id "${step.id}"`,
          path: [index, 'id'],
        })
      }
      seen.add(step.id)
    }
  }),
}).strict()

export type ParsedWorkflowConfig = z.infer<typeof workflowConfigSchema>
