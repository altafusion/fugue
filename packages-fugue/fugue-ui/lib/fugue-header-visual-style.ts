/** Structural chrome presets for {@link FugueAppHeader}. Colors stay in site palette / tokens. */
export type FugueHeaderVisualStyle = 'default' | 'landing-fixed' | 'landing-static'

export const FUGUE_HEADER_VISUAL_STYLE_DEFAULT: FugueHeaderVisualStyle = 'default'

export function isLandingHeaderStyle(style: FugueHeaderVisualStyle): boolean {
  return style === 'landing-fixed' || style === 'landing-static'
}
