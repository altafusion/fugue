import { shallowRef } from 'vue'
import { useShellI18n } from './useShellI18n'

export interface AppNavItem {
  /** Display label (fallback when `labelKey` is unset or i18n is off). */
  label: string
  /** i18n message key — e.g. `nav.about` from `i18n/locales/*.yaml`. */
  labelKey?: string
  /** Locale-neutral route — resolved with `localePath` when i18n is enabled. */
  to: string
  icon: string
  /** Matches `route.meta.nav.primary` when set on a page */
  id?: string
}

const navItems = shallowRef<AppNavItem[]>([])

/** Register primary nav items for the current app session (clear on teardown if needed). */
export function setAppNavItems(items: AppNavItem[]) {
  navItems.value = items
}

/**
 * Primary app header navigation for consumer product layouts.
 * Items come from `setAppNavItems`, then `runtimeConfig.public.appNav`, then empty.
 *
 * When i18n is enabled, `to` is passed through `localePath` and `labelKey` is translated.
 */
export function useAppNav() {
  const route = useRoute()
  const configItems = useRuntimeConfig().public.appNav as AppNavItem[] | undefined
  const { localePath, t } = useShellI18n()

  const sourceItems = computed((): AppNavItem[] => {
    if (navItems.value.length > 0)
      return navItems.value
    if (Array.isArray(configItems) && configItems.length > 0)
      return configItems
    return []
  })

  const items = computed((): AppNavItem[] => {
    return sourceItems.value.map(item => ({
      ...item,
      label: item.labelKey
        ? t(item.labelKey, item.label)
        : item.label,
      to: localePath(item.to)
    }))
  })

  const activeId = computed(() => {
    const nav = route.meta.nav as { primary?: string } | undefined
    if (nav?.primary)
      return nav.primary

    const matched = items.value.find(
      item => route.path === item.to || (item.to !== '/' && route.path.startsWith(`${item.to}/`))
    )
    return matched?.id
  })

  return {
    items,
    activeId
  }
}
