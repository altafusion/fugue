import type { Component } from 'vue'
import type { EffectState, InputConfig, StepConfig } from './workflow'

export interface WorkflowStepView {
  /** Warn that this step renders nothing — a real dead end, not a terminal screen. */
  shouldWarnEmpty: boolean
  stepInputs: InputConfig[]
  values: Record<string, unknown>
  /** Full Context — projected per composite via its `reads` contract. */
  context: Record<string, unknown>
  fieldErrors: Record<string, string | undefined>
  fieldOptions: Record<string, unknown[]>
  effects: Record<string, EffectState>
  isBusy: boolean
  /** For field `:disabled` — excludes pending `validate:` so typing keeps focus. */
  isInputBusy: boolean
  /** Components backing `type: composite` inputs, from the flow's registry. */
  components?: Record<string, Component>
  currentStep?: StepConfig
  showBack: boolean
  canComplete: boolean
  advance: () => Promise<void>
  back: () => void
  runAction: (actionId: string) => Promise<void>
  setValue: (field: string, value: unknown) => void
  setCompositeReady: (field: string, ready: boolean) => void
  setFieldError: (field: string, error: string | undefined) => void
  /** Pin step actions to the bottom of the scrollport. Default true. */
  stickyFooter?: boolean
}
