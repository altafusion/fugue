import type { DrawerSide } from '../types/workflow'

export const WIZARD_DRAWER_HEADER_UI = {
  header: 'items-baseline!',
  title: 'text-base! my-0! leading-none!',
  description: 'text-xs! mt-1! mb-0!',
  actions: 'items-baseline!',
} as const

export const WIZARD_DRAWER_BODY_CLASS = 'overflow-y-auto'

/** Side-specific drawer content sizing (geometry via `wizard-tokens.css`). */
export const WIZARD_DRAWER_SIZE_CLASSES: Record<DrawerSide, string> = {
  bottom:
    'min-h-[var(--workflow-drawer-bottom-min-height)] max-h-[var(--workflow-drawer-bottom-max-height)]',
  left: 'w-full sm:w-[var(--workflow-drawer-width)] max-w-[var(--workflow-drawer-max-width)]',
  right: 'w-full sm:w-[var(--workflow-drawer-width)] max-w-[var(--workflow-drawer-max-width)]',
}
