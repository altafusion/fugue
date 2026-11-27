import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { createDevToolsRegistry } from './devtoolsRegistry'

const Stub = { render: () => null }

describe('createDevToolsRegistry', () => {
  it('registers sections as privileged by default and orders them', () => {
    const registry = createDevToolsRegistry({ isDev: true })
    registry.registerSection({ id: 'b', label: 'B', component: Stub, order: 2 })
    registry.registerSection({ id: 'a', label: 'A', component: Stub, order: 1 })
    expect(registry.sections.value.map(s => [s.id, s.access])).toEqual([
      ['a', 'privileged'],
      ['b', 'privileged'],
    ])
  })

  it('replaces a section registered twice with the same id', () => {
    const registry = createDevToolsRegistry({ isDev: true })
    registry.registerSection({ id: 'a', label: 'One', component: Stub })
    registry.registerSection({ id: 'a', label: 'Two', component: Stub })
    expect(registry.sections.value).toHaveLength(1)
    expect(registry.sections.value[0]!.label).toBe('Two')
  })

  it('unregisters through the returned function', () => {
    const registry = createDevToolsRegistry({ isDev: true })
    const off = registry.registerSection({ id: 'a', label: 'A', component: Stub })
    off()
    expect(registry.sections.value).toHaveLength(0)
  })

  it('hides privileged sections outside dev when no resolver is set', () => {
    const registry = createDevToolsRegistry({ isDev: false })
    registry.registerSection({ id: 'pub', label: 'P', component: Stub, access: 'public' })
    registry.registerSection({ id: 'priv', label: 'X', component: Stub })
    expect(registry.visibleSections.value.map(s => s.id)).toEqual(['pub'])
  })

  it('shows privileged sections in dev by default', () => {
    const registry = createDevToolsRegistry({ isDev: true })
    registry.registerSection({ id: 'priv', label: 'X', component: Stub })
    expect(registry.visibleSections.value.map(s => s.id)).toEqual(['priv'])
  })

  it('follows a reactive resolver and stays locked until it returns true', async () => {
    const registry = createDevToolsRegistry({ isDev: false })
    const session = ref<boolean | undefined>(undefined)
    registry.setAccessResolver(() => session.value === true)
    registry.registerSection({ id: 'priv', label: 'X', component: Stub })
    expect(registry.visibleSections.value).toHaveLength(0)
    session.value = true
    await nextTick()
    expect(registry.visibleSections.value).toHaveLength(1)
    session.value = false
    await nextTick()
    expect(registry.visibleSections.value).toHaveLength(0)
  })

  it('falls back to the first visible section when the active one disappears', async () => {
    const registry = createDevToolsRegistry({ isDev: false })
    const allowed = ref(true)
    registry.setAccessResolver(() => allowed.value)
    registry.registerSection({ id: 'pub', label: 'P', component: Stub, access: 'public', order: 2 })
    registry.registerSection({ id: 'priv', label: 'X', component: Stub, order: 1 })
    registry.activeId.value = 'priv'
    expect(registry.activeSection.value?.id).toBe('priv')
    allowed.value = false
    await nextTick()
    expect(registry.activeSection.value?.id).toBe('pub')
  })
})
