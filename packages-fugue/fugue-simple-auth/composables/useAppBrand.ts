import type { AppBrand, AppBrandConfig, AppHeaderConfig } from '../types/app-brand'

/** Brand from `app.config.brand` with runtime fallbacks (no shell or site-config module required). */
export function useAppBrand(): ComputedRef<AppBrand> {
  const appConfig = useAppConfig()
  const runtimeAppName = useRuntimeConfig().public.appName as string | undefined

  return computed(() => {
    const configured = appConfig.brand as AppBrandConfig | undefined
    const header = appConfig.header as AppHeaderConfig | undefined
    const name = configured?.name
      ?? header?.title
      ?? runtimeAppName
      ?? 'App'

    return {
      name,
      logo: configured?.logo,
      logoAlt: configured?.logoAlt ?? name,
      logoClass: configured?.logoClass
    }
  })
}
