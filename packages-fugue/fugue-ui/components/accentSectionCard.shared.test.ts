import { describe, expect, it } from 'vitest'
import {
  ACCENT_SECTION_CARD_VISUAL_STYLE_COLORS,
  accentSectionCardBorderAccentClass,
  buildAccentSectionCardUCardUi,
  mergeAccentSectionCardUi,
  resolveAccentSectionCardAccent,
  resolveAccentSectionCardClose,
} from './accentSectionCard.shared'

describe('accentSectionCardBorderAccentClass', () => {
  it('maps semantic colors to border-s utilities', () => {
    expect(accentSectionCardBorderAccentClass('primary', false)).toBe('border-s-primary')
    expect(accentSectionCardBorderAccentClass('success', false)).toBe('border-s-success')
    expect(accentSectionCardBorderAccentClass('error', false)).toBe('border-s-error')
  })

  it('uses neutral stripe when disabled', () => {
    expect(accentSectionCardBorderAccentClass('primary', true)).toBe('border-s-neutral')
  })
})

describe('resolveAccentSectionCardAccent', () => {
  it('prefers accentColor over palette and color', () => {
    const resolved = resolveAccentSectionCardAccent({
      accentColor: '#112233',
      palette: 'fuchsia',
      color: 'error',
    })
    expect(resolved).toEqual({
      mode: 'custom',
      borderClass: 'border-s-4',
      style: { borderInlineStartColor: '#112233' },
    })
  })

  it('prefers palette over color when accentColor is omitted', () => {
    const resolved = resolveAccentSectionCardAccent({
      palette: 'emerald',
      color: 'error',
    })
    expect(resolved).toEqual({
      mode: 'custom',
      borderClass: 'border-s-4',
      style: { borderInlineStartColor: ACCENT_SECTION_CARD_VISUAL_STYLE_COLORS.emerald },
    })
  })

  it('uses semantic color when only color is set', () => {
    expect(resolveAccentSectionCardAccent({ color: 'warning' })).toEqual({
      mode: 'semantic',
      borderClass: 'border-s-warning',
    })
  })

  it('maps palette fuchsia to the composer palette hex', () => {
    const resolved = resolveAccentSectionCardAccent({ palette: 'fuchsia' })
    expect(resolved.mode).toBe('custom')
    if (resolved.mode === 'custom')
      expect(resolved.style.borderInlineStartColor).toBe('#e879f9')
  })

  it('clears custom accent when disabled', () => {
    const resolved = resolveAccentSectionCardAccent({
      accentColor: '#ff00ff',
      palette: 'blue',
      disabled: true,
    })
    expect(resolved).toEqual({
      mode: 'semantic',
      borderClass: 'border-s-neutral',
    })
  })
})

describe('resolveAccentSectionCardClose', () => {
  it('hides the close control when close is omitted or false', () => {
    expect(resolveAccentSectionCardClose(undefined)).toEqual({ show: false, buttonProps: {} })
    expect(resolveAccentSectionCardClose(false)).toEqual({ show: false, buttonProps: {} })
  })

  it('uses default ghost neutral xs square button when close is true', () => {
    expect(resolveAccentSectionCardClose(true)).toEqual({
      show: true,
      buttonProps: {
        'type': 'button',
        'color': 'neutral',
        'variant': 'ghost',
        'size': 'xs',
        'square': true,
        'aria-label': 'Close',
      },
    })
  })

  it('merges ButtonProps when close is an object', () => {
    const resolved = resolveAccentSectionCardClose({ 'aria-label': 'Dismiss section' })
    expect(resolved.show).toBe(true)
    expect(resolved.buttonProps['aria-label']).toBe('Dismiss section')
    expect(resolved.buttonProps.variant).toBe('ghost')
  })
})

describe('mergeAccentSectionCardUi', () => {
  it('returns defaults when ui is omitted', () => {
    const merged = mergeAccentSectionCardUi()
    expect(merged.title).toBe('accent-section-title')
    expect(merged.icon).toBe('accent-section-icon')
    expect(merged.titleRow).toBe('accent-section-title-row min-w-0 flex-1 flex items-center gap-2')
    expect(merged.card?.header).toContain('--accent-section-header-py')
    expect(merged.overlay).toBe('absolute inset-0 z-[5] cursor-not-allowed bg-default/50')
    expect(String(merged.overlay)).not.toContain('pointer-events-none')
  })

  it('merges slot overrides', () => {
    const merged = mergeAccentSectionCardUi({ title: 'text-lg' })
    expect(merged.title).toEqual(expect.stringContaining('accent-section-title'))
    expect(merged.title).toEqual(expect.stringContaining('text-lg'))
  })
})

function cardUiRootClassString(root: unknown): string {
  if (root === null || root === undefined)
    return ''
  if (Array.isArray(root))
    return root.map(String).join(' ')
  return String(root)
}

describe('buildAccentSectionCardUCardUi', () => {
  it('applies border-s-neutral on root when disabled after border-muted merge', () => {
    const merged = mergeAccentSectionCardUi()
    const accent = accentSectionCardBorderAccentClass('primary', true)
    const ui = buildAccentSectionCardUCardUi(merged, accent, true)
    const rootStr = cardUiRootClassString(ui.root)
    expect(rootStr).toContain('border-muted')
    expect(rootStr).toContain('border-s-neutral')
    expect(rootStr.lastIndexOf('border-s-neutral')).toBeGreaterThan(rootStr.lastIndexOf('border-muted'))
  })

  it('does not merge shell root preset onto the card root slot', () => {
    const merged = mergeAccentSectionCardUi()
    const ui = buildAccentSectionCardUCardUi(merged, 'border-s-primary', false)
    const rootStr = cardUiRootClassString(ui.root)
    expect(rootStr).not.toContain('relative')
    expect(rootStr).toContain('w-full')
  })
})
