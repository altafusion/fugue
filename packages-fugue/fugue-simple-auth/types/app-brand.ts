export interface AppHeaderConfig {
  title?: string
  showColorMode?: boolean
}

/** Product app branding — set in each app's `app.config.ts`. */
export interface AppBrandConfig {
  name?: string
  logo?: string
  logoAlt?: string
  /** Extra classes on the logo `<img>` (e.g. `dark:brightness-0 dark:invert`). */
  logoClass?: string
  favicon?: string
}

/** Resolved brand values for login chrome and headers. */
export interface AppBrand {
  name: string
  logo?: string
  logoAlt: string
  logoClass?: string
}
