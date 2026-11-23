import { WIZARD_DRAWER_BODY_CLASS, WIZARD_DRAWER_HEADER_UI } from './drawer'
import {
  WIZARD_PAGE_HEADER_UI_DEFAULT,
  WIZARD_PAGE_HEADER_UI_RECIPES,
  WIZARD_SHELL_CONTENT_COLUMN_CLASS,
} from './shell'
import { WIZARD_STEPPER_SHELL_UI } from './stepper'

/** Nuxt UI slot replacer — return value replaces theme defaults (string ui merges; twMerge last-wins on conflicts). */
function pageHeaderSlot(classes: string): () => string {
  return () => classes
}

/** Resolved page header `:ui` slots (replacer functions for UPageHeader). */
export type ResolvedPageHeaderUi = Record<string, string | (() => string)>

export interface WorkflowWizardChromeOverrides {
  shellContentColumnClass?: string
  stepperUi?: Record<string, string>
  drawerHeaderUi?: Partial<Record<keyof typeof WIZARD_DRAWER_HEADER_UI, string>>
  drawerBodyClass?: string
  /** Shallow-merged over recipe/default page header ui */
  pageHeaderUi?: ResolvedPageHeaderUi
}

export function resolveWizardChrome(
  overrides?: Partial<WorkflowWizardChromeOverrides>,
  options?: { recipesEnabled?: boolean },
) {
  const basePageHeader = options?.recipesEnabled
    ? WIZARD_PAGE_HEADER_UI_RECIPES
    : WIZARD_PAGE_HEADER_UI_DEFAULT

  const pageHeaderMerged = {
    ...basePageHeader,
    ...overrides?.pageHeaderUi,
  }
  const pageHeaderUi: ResolvedPageHeaderUi = Object.fromEntries(
    Object.entries(pageHeaderMerged).map(([key, value]) => [
      key,
      typeof value === 'function'
        ? value
        : pageHeaderSlot(String(value ?? '')),
    ]),
  )

  return {
    shellContentColumnClass:
      overrides?.shellContentColumnClass ?? WIZARD_SHELL_CONTENT_COLUMN_CLASS,
    stepperUi: {
      ...WIZARD_STEPPER_SHELL_UI,
      ...overrides?.stepperUi,
    },
    drawerHeaderUi: {
      ...WIZARD_DRAWER_HEADER_UI,
      ...overrides?.drawerHeaderUi,
    },
    drawerBodyClass: overrides?.drawerBodyClass ?? WIZARD_DRAWER_BODY_CLASS,
    pageHeaderUi,
  }
}
