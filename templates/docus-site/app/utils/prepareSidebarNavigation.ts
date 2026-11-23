import type { ContentNavigationItem } from '@nuxt/content'

function isCollapsedSection(path: string, suffixes: readonly string[]): boolean {
  return suffixes.some(suffix => path.endsWith(suffix))
}

function containsRoute(item: ContentNavigationItem, path: string): boolean {
  if (item.path === path)
    return true

  return item.children?.some(child => containsRoute(child, path)) ?? false
}

export function prepareSidebarNavigation(
  items: ContentNavigationItem[],
  routePath: string,
  collapsedSectionSuffixes: readonly string[] = []
): ContentNavigationItem[] {
  return items.map((item) => {
    const children = item.children?.length
      ? prepareSidebarNavigation(item.children, routePath, collapsedSectionSuffixes)
      : item.children

    const branch = children
      ? { ...item, children }
      : item
    let defaultOpen = item.defaultOpen

    if (isCollapsedSection(item.path, collapsedSectionSuffixes)) {
      defaultOpen = containsRoute(branch, routePath)
        ? undefined
        : false
    }

    return {
      ...item,
      ...(defaultOpen !== undefined
        ? { defaultOpen }
        : {}),
      ...(children
        ? { children }
        : {})
    }
  })
}
