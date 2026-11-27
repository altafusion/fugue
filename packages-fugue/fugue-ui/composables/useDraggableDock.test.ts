import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { useDraggableDock } from './useDraggableDock'

const KEY = 'test:dock'

/** Mounts a bare component that runs the composable, so `onMounted` (the saved-position read) fires as in an app. */
function mountDock(defaultPercent = 50) {
  let dock!: ReturnType<typeof useDraggableDock>
  const wrapper = mount(defineComponent({
    setup() {
      dock = useDraggableDock(ref(null), ref(null), ref(null), { storageKey: KEY, defaultPercent })
      return () => h('div')
    },
  }))
  return { wrapper, dock }
}

function press(dock: ReturnType<typeof useDraggableDock>, key: string, init: KeyboardEventInit = {}) {
  const event = new KeyboardEvent('keydown', { key, cancelable: true, ...init })
  dock.onKeydown(event)
  return event
}

describe('useDraggableDock keyboard', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('moves by 4 percent per arrow press and by 20 with Shift', async () => {
    const { dock } = mountDock()
    await nextTick()
    press(dock, 'ArrowRight')
    expect(dock.percent.value).toBe(54)
    press(dock, 'ArrowLeft')
    press(dock, 'ArrowLeft')
    expect(dock.percent.value).toBe(46)
    press(dock, 'ArrowRight', { shiftKey: true })
    expect(dock.percent.value).toBe(66)
  })

  it('jumps to the edges with Home and End and never passes them', async () => {
    const { dock } = mountDock()
    await nextTick()
    press(dock, 'Home')
    expect(dock.percent.value).toBe(0)
    press(dock, 'ArrowLeft', { shiftKey: true })
    expect(dock.percent.value).toBe(0)
    press(dock, 'End')
    expect(dock.percent.value).toBe(100)
    press(dock, 'ArrowRight', { shiftKey: true })
    expect(dock.percent.value).toBe(100)
  })

  it('cancels the keys it handles and leaves the others alone', async () => {
    const { dock } = mountDock()
    await nextTick()
    expect(press(dock, 'ArrowRight').defaultPrevented).toBe(true)
    expect(press(dock, 'Tab').defaultPrevented).toBe(false)
    expect(press(dock, 'a').defaultPrevented).toBe(false)
    expect(dock.percent.value).toBe(54)
  })

  it('remembers the position in localStorage', async () => {
    const { dock } = mountDock()
    await nextTick()
    press(dock, 'End')
    await nextTick()
    expect(localStorage.getItem(KEY)).toBe('100')
  })
})

describe('useDraggableDock saved position', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('restores a saved percentage', async () => {
    localStorage.setItem(KEY, '20')
    const { dock } = mountDock()
    await nextTick()
    expect(dock.dockStyle.value.transform).toBe('translateX(-20%)')
  })

  it('falls back to the default when the saved value is not a number', async () => {
    localStorage.setItem(KEY, 'abc')
    const { dock } = mountDock(30)
    await nextTick()
    expect(dock.percent.value).toBe(30)
    expect(dock.dockStyle.value.transform).toBe('translateX(-30%)')
    expect(dock.dockStyle.value.left).not.toContain('NaN')
  })

  it('limits an out-of-range saved value to the page', async () => {
    localStorage.setItem(KEY, '250')
    const { dock } = mountDock()
    await nextTick()
    expect(dock.percent.value).toBe(100)
    press(dock, 'ArrowLeft')
    expect(dock.percent.value).toBe(96)
  })
})
