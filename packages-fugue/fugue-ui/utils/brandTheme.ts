/**
 * Portable kit — mirror in @altafusion/fugue-ui (`utils/brandTheme.ts`) or a neighbor `@altafusion/fugue-ui`.
 */

export interface BrandDefinition {
  id: string
  label: string
  /** Nuxt UI `ui.colors.primary` scale name (e.g. violet, blue, green) */
  primary: string
}

/** At least one brand — brands[0] always defined. */
export type NonEmptyBrands = readonly [BrandDefinition, ...BrandDefinition[]]

export interface BrandThemeConfig<T extends NonEmptyBrands = NonEmptyBrands> {
  brands: T
  cookieKey: string
  defaultBrandId?: T[number]['id']
}

export function resolveBrandMeta<T extends NonEmptyBrands>(
  config: Pick<BrandThemeConfig<T>, 'brands' | 'defaultBrandId'>,
  id: string | null | undefined,
): T[number] {
  const { brands, defaultBrandId } = config
  const match = brands.find(b => b.id === id)
  if (match)
    return match
  if (defaultBrandId != null) {
    const fallback = brands.find(b => b.id === defaultBrandId)
    if (fallback)
      return fallback
  }
  return brands[0]
}

export function isKnownBrandId<T extends readonly BrandDefinition[]>(
  brands: T,
  id: string | null | undefined,
): id is T[number]['id'] {
  return id != null && brands.some(b => b.id === id)
}
