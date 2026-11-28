import { describe, expect, it } from 'vitest'
import { FLOATING_DOCK_BAR_CLASS, FLOATING_DOCK_PANEL_CLASS, floatingDockClasses } from './floatingDock.shared'

describe('floatingDockClasses', () => {
  it('returns the defaults without a ui', () => {
    expect(floatingDockClasses()).toEqual({ bar: FLOATING_DOCK_BAR_CLASS, panel: FLOATING_DOCK_PANEL_CLASS })
  })

  it('lets the site replace a conflicting class and keeps the rest', () => {
    const { bar } = floatingDockClasses({ bar: 'bg-elevated' })
    expect(bar).toContain('bg-elevated')
    expect(bar).not.toContain('bg-default')
    expect(bar).toContain('rounded-full')
  })

  it('treats a dark: class as its own variant, replacing only a dark: one', () => {
    const { bar } = floatingDockClasses({
      bar: ['dark:bg-[#1e1e77]', 'dark:bg-[#102040]'],
    })
    expect(bar).toContain('bg-default')
    expect(bar).toContain('dark:bg-[#102040]')
    expect(bar).not.toContain('dark:bg-[#1e1e77]')
  })

  it('styles the panel separately from the bar', () => {
    const { bar, panel } = floatingDockClasses({ panel: 'px-2' })
    expect(panel).toContain('px-2')
    expect(panel).not.toContain('px-4')
    expect(bar).toBe(FLOATING_DOCK_BAR_CLASS)
  })
})
