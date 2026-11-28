import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref, useTemplateRef } from 'vue'
import FloatingDock from './FloatingDock.vue'

beforeEach(() => {
  vi.stubGlobal('computed', computed)
  vi.stubGlobal('useTemplateRef', useTemplateRef)
  vi.stubGlobal('useDraggableDock', () => ({
    dragging: ref(false),
    dockStyle: ref({}),
    onKeydown: () => {},
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function mountDock(props: Record<string, unknown> = {}) {
  return mount(FloatingDock, {
    props: { storageKey: 'test:dock', label: 'Test', ...props },
    global: {
      stubs: { Teleport: true, UButton: true },
    },
  })
}

/** The fixed wrapper that covers the page: the first element in the (stubbed) teleport. */
function wrapperOf(wrapper: ReturnType<typeof mountDock>) {
  return wrapper.find('div.fixed').element as HTMLElement
}

describe('floatingDock stacking', () => {
  it('defaults to z-index 40 on the wrapper', () => {
    expect(wrapperOf(mountDock()).style.zIndex).toBe('40')
  })

  it('applies a numeric zIndex to the wrapper', () => {
    expect(wrapperOf(mountDock({ zIndex: 70 })).style.zIndex).toBe('70')
  })

  it('applies a CSS value for zIndex to the wrapper', () => {
    expect(wrapperOf(mountDock({ zIndex: 'var(--devtools-z-dock)' })).style.zIndex).toBe('var(--devtools-z-dock)')
  })

  it('no longer hard-codes a z class on the wrapper', () => {
    expect(wrapperOf(mountDock({ zIndex: 70 })).className).not.toMatch(/\bz-\d+\b/)
  })
})
