import { WIZARD_RING_OFFSET_BASE } from './rings'

export const WIZARD_STEPPER_SHELL_UI = {
  title: 'text-lg font-medium text-default truncate',
  description: 'text-sm text-muted truncate md:whitespace-normal md:text-wrap',
} as const

export const WIZARD_STEPPER_ACTIVE_TRIGGER = `${WIZARD_RING_OFFSET_BASE} ring-primary`
export const WIZARD_STEPPER_ERROR_TRIGGER = `${WIZARD_RING_OFFSET_BASE} ring-error`
