import type { Component, VNode } from 'vue'
import type { ShellBrand, ShellBrandConfig, ShellHeaderConfig } from '../../types/app-brand'
import type { AppNavItem } from './useAppNav'
import { shellDisplayNameKey } from '../../lib/injection-keys'
import { useShellI18n } from './useShellI18n'

export interface ShellChromeOptions {
  /** Site header (FugueAppHeader). Default true except on `minimal` layout. */
  header?: boolean
  /** Footer chrome. Default true on `default` layout only. */
  footer?: boolean
  /** Padding on the main content region. Default true on `default` layout. */
  mainPadding?: boolean
}

/**
 * Shell chrome flags from route meta with layout-aware defaults.
 */
export function useShellChrome() {
  const route = useRoute()

  const layout = computed(() => {
    const name = route.meta.layout
    if (name === false)
      return 'none'
    return typeof name === 'string'
      ? name
      : 'default'
  })

  const metaChrome = computed(() => route.meta.shell as ShellChromeOptions | undefined)

  const showHeader = computed(() => {
    if (layout.value === 'minimal' || layout.value === 'none')
      return false
    return metaChrome.value?.header ?? true
  })

  const showFooter = computed(() => {
    if (layout.value !== 'default')
      return false
    return metaChrome.value?.footer ?? true
  })

  const mainPadding = computed(() => {
    if (layout.value === 'default')
      return metaChrome.value?.mainPadding ?? true
    return metaChrome.value?.mainPadding ?? false
  })

  return {
    layout,
    showHeader,
    showFooter,
    mainPadding
  }
}

export interface ShellSiteHeaderState {
  title: ComputedRef<string>
  brand: ComputedRef<ShellBrand>
  homeTo: ComputedRef<string>
  navItems: ComputedRef<AppNavItem[]>
  activeNavId: ComputedRef<string | undefined>
  showColorMode: ComputedRef<boolean>
  visualStyle: ComputedRef<'default' | 'landing-fixed' | 'landing-static'>
  headerActions: Component | (() => VNode) | null
  headerRight: Component | (() => VNode) | null
}

/** Shared wiring for ShellSiteHeader — apps override the component, not this composable. */
export function useShellSiteHeader(): ShellSiteHeaderState {
  const appConfig = useAppConfig()
  const runtimeAppName = useRuntimeConfig().public.appName as string | undefined
  const { items, activeId } = useAppNav()
  const { localePath } = useShellI18n()
  const headerActions = useShellHeaderActions()
  const headerRight = useShellHeaderRight()
  const studioDisplayName = inject(shellDisplayNameKey, ref<string | undefined>(undefined))

  const homeTo = computed(() => localePath('/'))

  const brand = computed<ShellBrand>(() => {
    const configured = appConfig.brand as ShellBrandConfig | undefined
    const header = appConfig.header as ShellHeaderConfig | undefined
    const name = header?.title
      ?? studioDisplayName.value
      ?? configured?.name
      ?? runtimeAppName
      ?? 'App'

    return {
      name,
      logo: configured?.logo,
      logoAlt: configured?.logoAlt ?? name,
      logoClass: configured?.logoClass,
      favicon: configured?.favicon
    }
  })

  const title = computed(() => brand.value.name)

  const showColorMode = computed(
    () => (appConfig.header as ShellHeaderConfig | undefined)?.showColorMode ?? true
  )

  const visualStyle = computed(
    () => (appConfig.header as ShellHeaderConfig | undefined)?.visualStyle ?? 'default'
  )

  return {
    title,
    brand,
    homeTo,
    navItems: items,
    activeNavId: activeId,
    showColorMode,
    visualStyle,
    headerActions,
    headerRight
  }
}
