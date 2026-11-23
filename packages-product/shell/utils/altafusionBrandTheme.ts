import type { BrandThemeConfig } from '@altafusion/fugue-ui/utils/brandTheme'

export const ALTAFUSION_BRANDS = [
  { id: 'default' as const, label: 'Default', primary: 'blue' as const },
  { id: 'violet' as const, label: 'Violet', primary: 'violet' as const },
  { id: 'green' as const, label: 'Green', primary: 'green' as const }
] as const

export const ALTAFUSION_BRAND_THEME = {
  brands: ALTAFUSION_BRANDS,
  cookieKey: 'altafusion:brand',
  defaultBrandId: 'default' as const
} as const satisfies BrandThemeConfig<typeof ALTAFUSION_BRANDS>

export type BrandId = typeof ALTAFUSION_BRANDS[number]['id']
