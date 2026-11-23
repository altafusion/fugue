export const FUGUE_CONTENT_404_DEFAULTS = {
  statusCode: 404,
  title: 'Page Not Found',
  description: 'The page you requested does not exist or may have moved.',
  actionLabel: 'Back to Home',
  actionTo: '/'
} as const

/** i18n keys — translate in the app `i18n/locales/*.yaml` under `fugueContent404.*`. */
export const FUGUE_CONTENT_404_I18N_KEYS = {
  title: 'fugueContent404.title',
  description: 'fugueContent404.description',
  actionLabel: 'fugueContent404.actionLabel'
} as const

export interface FugueContent404Copy {
  title: string
  description: string
  actionLabel: string
}

export function resolveFugueContent404Copy(
  t: (_key: string, _fallback: string) => string
): FugueContent404Copy {
  return {
    title: t(FUGUE_CONTENT_404_I18N_KEYS.title, FUGUE_CONTENT_404_DEFAULTS.title),
    description: t(FUGUE_CONTENT_404_I18N_KEYS.description, FUGUE_CONTENT_404_DEFAULTS.description),
    actionLabel: t(FUGUE_CONTENT_404_I18N_KEYS.actionLabel, FUGUE_CONTENT_404_DEFAULTS.actionLabel)
  }
}

export interface FugueContentPageRouteState {
  loading: boolean
  error: unknown
  contentPage: unknown
  i18nReady: boolean
}

export function isFugueContent404(state: FugueContentPageRouteState): boolean {
  return state.i18nReady && !state.loading && !state.error && !state.contentPage
}
