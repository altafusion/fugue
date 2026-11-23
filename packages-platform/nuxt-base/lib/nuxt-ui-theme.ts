/**
 * Nuxt UI 4 theme config — maps legacy flat `primary` / `gray` to `ui.colors`.
 *
 * @nuxt/ui defaults `colors.primary` to `green`; flat keys on `ui` do not override it.
 */

/** Nuxt UI semantic color slots → Tailwind scale names. */
export interface NuxtUiSemanticColors {
  primary?: string
  secondary?: string
  success?: string
  info?: string
  warning?: string
  error?: string
  neutral?: string
}

export interface NuxtUiThemeInput {
  primary?: string
  /** Legacy name — maps to Nuxt UI `colors.neutral`. */
  gray?: string
  colors?: NuxtUiSemanticColors
  notifications?: { position?: string, [key: string]: unknown }
  [key: string]: unknown
}

/**
 * Named palette — one object ties Nuxt UI semantic colors to app theme CSS.
 * App-local first (`apps/<site>/palette.ts`); promote shared palettes when reused.
 */
export interface SitePalette {
  id: string
  /** App theme slug — loads `{theme}-theme.css` via createAppConfig */
  theme: string
  nuxtUI: {
    colors: NuxtUiSemanticColors
    notifications?: { position?: string, [key: string]: unknown }
  }
  /** Dark canvas personality when `data-theme="dark"` — `gray` (default) or `black`. */
  darkCanvas?: 'gray' | 'black'
  /** Brand & Surfaces token file (loaded via `{theme}-theme.css` @import chain) */
  tokens?: string
}

const DEFAULT_SEMANTIC_COLORS: Required<NuxtUiSemanticColors> = {
  primary: 'blue',
  secondary: 'blue',
  success: 'green',
  info: 'blue',
  warning: 'yellow',
  error: 'red',
  neutral: 'slate',
}

/** Build `ui` module config for `createAppConfig` / `nuxt.config`. */
export function buildNuxtUIConfig(options: NuxtUiThemeInput = {}) {
  const {
    primary,
    gray,
    colors: colorsOption,
    notifications,
    main,
    ...rest
  } = options

  const fromFlat: Record<string, string> = {}
  if (primary !== undefined)
    fromFlat.primary = primary
  if (gray !== undefined)
    fromFlat.neutral = gray

  const colors = {
    ...DEFAULT_SEMANTIC_COLORS,
    ...fromFlat,
    ...(colorsOption ?? {}),
  }

  return {
    colors,
    notifications: {
      position: 'top-0 bottom-auto',
      ...(notifications ?? {}),
    },
    ...rest,
    /**
     * Override Nuxt UI `main` min-height (`calc(100vh-header)`). With a real
     * header + footer sibling that always overflows the viewport by ~footer
     * height. Apps can still override via `main` / `app.config`.
     */
    main: {
      base: 'flex-1 w-full min-h-0',
      ...(typeof main === 'object' && main
        ? main
        : {}),
    },
  }
}

/** Same shape for `app/app.config.ts` → keep in sync with `siteConfigTheme.nuxtUIOptions`. */
export function mirrorAppUiTheme(options: NuxtUiThemeInput = {}) {
  return buildNuxtUIConfig(options)
}

/** Extract `nuxtUIOptions` for `siteConfigTheme` from a named palette. */
export function nuxtUIOptionsFromPalette(palette: SitePalette): NuxtUiThemeInput {
  return {
    colors: palette.nuxtUI.colors,
    ...(palette.nuxtUI.notifications
      ? { notifications: palette.nuxtUI.notifications }
      : {}),
  }
}

/** Build `siteConfigTheme` for `defineFugueContentSite(..., siteConfigTheme)`. */
export function siteConfigThemeFromPalette(
  palette: SitePalette,
  extra: { enableNuxtUI?: boolean } = {},
) {
  return {
    theme: palette.theme,
    enableNuxtUI: extra.enableNuxtUI ?? true,
    nuxtUIOptions: nuxtUIOptionsFromPalette(palette),
    darkCanvas: palette.darkCanvas ?? 'gray',
  }
}

/** Mirror palette Nuxt UI colors in `app/app.config.ts`. */
export function mirrorAppUiThemeFromPalette(palette: SitePalette) {
  return buildNuxtUIConfig(nuxtUIOptionsFromPalette(palette))
}
