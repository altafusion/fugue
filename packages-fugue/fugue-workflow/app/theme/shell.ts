export const WIZARD_ROOT_CLASS = 'fugue-workflow-wizard'
export const WIZARD_PAGE_HEADER_CLASS = 'fugue-workflow-page-header'

export const WIZARD_STICKY_FOOTER_CLASS
  = 'sticky bottom-0 z-10 mt-6 border-t border-default bg-default/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-default/80'

export const WIZARD_SHELL_CONTENT_COLUMN_CLASS
  = 'mx-auto min-w-0 max-w-2xl md:max-w-full space-y-8 overflow-x-clip pb-16'

/**
 * UPageHeader `ui` defaults. Applied as Nuxt slot replacers (full replace).
 * Title size/weight, header padding → `assets/css/wizard-tokens.css` (`--workflow-page-*` on `.fugue-workflow-page-header`).
 * Layout, alignment, color → this file (`WIZARD_PAGE_HEADER_UI_*`).
 * Include `flex` on wrapper — `flex-row` alone is not a flex container.
 * Put conflicting utilities last (e.g. color after text-highlighted).
 */
export const WIZARD_PAGE_HEADER_UI_DEFAULT = {
  root: `${WIZARD_PAGE_HEADER_CLASS} relative border-b border-default`,
  wrapper: 'flex flex-col lg:flex-row lg:items-center lg:justify-start gap-4',
  title: 'text-pretty text-highlighted text-center',
  description: 'text-pretty text-muted text-center',
} as const

export const WIZARD_PAGE_HEADER_UI_RECIPES = {
  root: `${WIZARD_PAGE_HEADER_CLASS} relative border-b border-default`,
  wrapper: 'flex flex-row flex-wrap items-baseline justify-between gap-x-4 gap-y-2 lg:items-baseline',
  title: 'text-pretty text-highlighted text-start',
  description: 'text-pretty text-muted text-start',
  links: 'flex flex-wrap items-center gap-1.5',
} as const
