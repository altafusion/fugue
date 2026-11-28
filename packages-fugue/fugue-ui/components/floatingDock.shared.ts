import type { ClassNameValue } from 'tailwind-merge'
import { twMerge } from 'tailwind-merge'

/** Classes a site can add to or override on a {@link FloatingDock}, as Nuxt UI's `ui` prop does: later classes win over the defaults. */
export interface FloatingDockUi {
  /** The rounded bar with the grip and the label button. */
  bar?: ClassNameValue
  /** The box above the bar that holds the default slot (shown while open). */
  panel?: ClassNameValue
}

export const FLOATING_DOCK_BAR_CLASS = 'pointer-events-auto flex w-fit items-center rounded-full border border-primary/40 bg-default p-0.5 shadow-lg'
export const FLOATING_DOCK_PANEL_CLASS = 'pointer-events-auto rounded-xl border border-primary/40 bg-default px-4 py-3 shadow-lg'

export function floatingDockClasses(ui?: FloatingDockUi) {
  return {
    bar: twMerge(FLOATING_DOCK_BAR_CLASS, ui?.bar),
    panel: twMerge(FLOATING_DOCK_PANEL_CLASS, ui?.panel),
  }
}
