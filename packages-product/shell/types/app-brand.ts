/** Product app branding — set in each app's `app.config.ts`. */
export interface ShellBrandConfig {
  /** Display name (header title fallback, logo alt fallback). */
  name?: string
  /** Public asset path, e.g. `/logo.svg`. */
  logo?: string
  logoAlt?: string
  /** Extra classes on the logo `<img>` (e.g. `dark:brightness-0 dark:invert`). */
  logoClass?: string
  /** Public favicon path, e.g. `/favicon.svg`. */
  favicon?: string
}

/** Resolved brand values after shell composable fallbacks. */
export interface ShellBrand {
  name: string
  logo?: string
  logoAlt: string
  logoClass?: string
  favicon?: string
}

export interface ShellSeoConfig {
  title?: string
  titleTemplate?: string
  description?: string
  ogImage?: string
  twitterCard?: 'summary' | 'summary_large_image'
}

export interface ShellHeaderConfig {
  title?: string
  showColorMode?: boolean
  /** Structural chrome preset — `default` (UHeader) or landing hash-nav styles. */
  visualStyle?: 'default' | 'landing-fixed' | 'landing-static'
}

export interface ShellAppConfig {
  brand?: ShellBrandConfig
  seo?: ShellSeoConfig
  header?: ShellHeaderConfig
}
