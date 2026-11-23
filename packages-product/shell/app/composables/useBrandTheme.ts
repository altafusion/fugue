import type { BrandId } from '../../utils/altafusionBrandTheme'
/**
 * useBrandTheme – composable shared via the @altafusion/shell layer.
 *
 * Runtime demo/dev variants (`default` / `violet` / `green`); site themes stay
 * build-time via `createAppConfig({ theme })` + `{app}-tokens.css`.
 */
import { isKnownBrandId } from '@altafusion/fugue-ui/utils/brandTheme'
import { ALTAFUSION_BRAND_THEME } from '../../utils/altafusionBrandTheme'

export type { BrandId }

export function useBrandTheme() {
  const { brands, cookieKey, defaultBrandId } = ALTAFUSION_BRAND_THEME
  const fallbackId = defaultBrandId ?? brands[0].id

  const brand = useCookie<BrandId>(cookieKey, {
    default: () => fallbackId,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax'
  })

  if (!isKnownBrandId(brands, brand.value))
    brand.value = fallbackId

  function setBrand(id: BrandId) {
    if (!isKnownBrandId(brands, id))
      return
    brand.value = id
  }

  return {
    brand: readonly(brand),
    setBrand,
    brands: readonly(brands)
  }
}
