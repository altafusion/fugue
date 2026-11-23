import { describe, expect, it } from 'vitest'
import { FUGUE_HEADER_VISUAL_STYLE_DEFAULT, isLandingHeaderStyle } from '../lib/fugue-header-visual-style'

describe('fugue header visual style', () => {
  it('defaults to default', () => {
    expect(FUGUE_HEADER_VISUAL_STYLE_DEFAULT).toBe('default')
  })

  it('isLandingHeaderStyle recognizes landing presets', () => {
    expect(isLandingHeaderStyle('landing-fixed')).toBe(true)
    expect(isLandingHeaderStyle('landing-static')).toBe(true)
    expect(isLandingHeaderStyle('default')).toBe(false)
  })
})
