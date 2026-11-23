import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import FileDropzone from './FileDropzone.vue'

/**
 * Component-level coverage for the behaviour the pure helpers in
 * `fileDropzone.shared.ts` can't reach: what the zone renders per state, and what it
 * does with drag events and focus.
 *
 * Two shims are needed because the component is written for a Nuxt runtime:
 * Vue APIs arrive by auto-import, and `U*` components by the Nuxt UI module.
 */
beforeEach(() => {
  vi.stubGlobal('ref', ref)
  vi.stubGlobal('computed', computed)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const stubs = {
  UIcon: true,
  UButton: { template: '<button v-bind="$attrs" />' },
}

function archive(name = 'app.zip', bytes = 2048): File {
  return new File([
    new Uint8Array(bytes),
  ], name, { type: 'application/zip' })
}

function mountDropzone(props: Record<string, unknown> = {}) {
  return mount(FileDropzone, {
    attachTo: document.body,
    props,
    global: { stubs },
  })
}

describe('fileDropzone rendering per state', () => {
  it('shows the selection with its size once a file is picked', () => {
    const text = mountDropzone({
      modelValue: archive('source.zip'),
    }).text()
    expect(text).toContain('source.zip')
    expect(text).toContain('2 KB')
  })

  it('keeps the selection visible while busy, rather than the stale drag prompt', () => {
    const text = mountDropzone({
      modelValue: archive('source.zip'),
      busy: true,
      label: 'Drag and drop a file here',
    }).text()

    expect(text).toContain('source.zip')
    expect(text).not.toContain('Drag and drop a file here')
  })

  it('falls back to the label while busy with nothing selected', () => {
    const text = mountDropzone({ busy: true, label: 'Processing…' }).text()
    expect(text).toContain('Processing…')
  })

  it('hides the clear button while inert so a busy upload cannot be cancelled halfway', () => {
    expect(mountDropzone({
      modelValue: archive(),
      busy: true,
    }).find('button').exists())
      .toBe(false)
  })
})

describe('fileDropzone drag handling', () => {
  function dispatch(el: Element, type: string): Event {
    const event = new Event(type, { bubbles: true, cancelable: true })
    el.dispatchEvent(event)
    return event
  }

  it.each(['dragover', 'dragenter', 'drop'])('cancels the browser default for %s', (type) => {
    const wrapper = mountDropzone()
    expect(dispatch(wrapper.element, type).defaultPrevented).toBe(true)
  })

  // Without this the browser handles the drop itself and navigates to the file,
  // replacing the app — `drop` only fires at all when `dragover` was cancelled.
  it.each(['dragover', 'dragenter', 'drop'])('cancels %s even while inert', (type) => {
    const wrapper = mountDropzone({ disabled: true })
    expect(dispatch(wrapper.element, type).defaultPrevented).toBe(true)
  })

  it('ignores a drop while inert instead of adopting the file', async () => {
    const wrapper = mountDropzone({ busy: true })
    await wrapper.trigger('drop')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})

describe('fileDropzone clearing', () => {
  it('clears the selection and keeps focus on the input, not the body', async () => {
    const wrapper = mountDropzone({
      modelValue: archive(),
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null])
    expect(document.activeElement).toBe(wrapper.find('input[type="file"]').element)
  })
})
