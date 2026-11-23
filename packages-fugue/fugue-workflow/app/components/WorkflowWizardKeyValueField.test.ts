import type { InputConfig } from '../types/workflow'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, nextTick, reactive, ref, watch } from 'vue'
import WorkflowWizardField from './WorkflowWizardField.vue'
import WorkflowWizardKeyValueField from './WorkflowWizardKeyValueField.vue'

const UFormFieldStub = defineComponent({
  name: 'UFormField',
  props: {
    error: { type: String, default: undefined },
  },
  template: '<div class="u-form-field"><slot /></div>',
})

const UInputStub = defineComponent({
  name: 'UInput',
  props: {
    modelValue: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  template: `
    <input
      class="u-input-stub"
      :value="modelValue"
      :disabled="disabled"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  `,
})

const UButtonStub = defineComponent({
  name: 'UButton',
  props: {
    label: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
  },
  emits: ['click'],
  template: `
    <button
      type="button"
      :disabled="disabled"
      @click="$emit('click')"
    >{{ label }}<slot /></button>
  `,
})

function mountKeyValueField(modelValue: Record<string, string> = {}) {
  const emitted: Record<string, string>[] = []

  const wrapper = mount(WorkflowWizardKeyValueField, {
    props: {
      modelValue,
      'onUpdate:modelValue': (value: Record<string, string>) => {
        emitted.push(value)
        wrapper.setProps({ modelValue: value })
      },
    },
    global: {
      components: {
        UInput: UInputStub,
        UButton: UButtonStub,
      },
    },
  })

  return { wrapper, emitted }
}

async function flush(): Promise<void> {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

beforeEach(() => {
  vi.stubGlobal('ref', ref)
  vi.stubGlobal('computed', computed)
  vi.stubGlobal('watch', watch)
  vi.stubGlobal('nextTick', nextTick)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('workflowWizardKeyValueField', () => {
  it('adds a row and emits a fresh object without empty-key rows', async () => {
    const { wrapper, emitted } = mountKeyValueField()
    const initialModel = wrapper.props('modelValue')

    await wrapper.find('[data-testid="key-value-add"]').trigger('click')
    await flush()

    const keyInputs = wrapper.findAll('[data-testid="key-value-key"]')
    const valueInputs = wrapper.findAll('[data-testid="key-value-value"]')
    await keyInputs[0]!.setValue('X-Trace')
    await valueInputs[0]!.setValue('1')
    await flush()

    expect(emitted.at(-1)).toEqual({ 'X-Trace': '1' })
    expect(emitted.at(-1)).not.toBe(initialModel)
  })

  it('drops rows with empty keys and lets last duplicate key win', async () => {
    const { wrapper, emitted } = mountKeyValueField({ 'first-key': 'old' })

    await wrapper.find('[data-testid="key-value-add"]').trigger('click')
    await flush()

    const keyInputs = wrapper.findAll('[data-testid="key-value-key"]')
    const valueInputs = wrapper.findAll('[data-testid="key-value-value"]')
    await keyInputs[1]!.setValue('first-key')
    await valueInputs[1]!.setValue('new')
    await keyInputs[0]!.setValue('')
    await flush()

    expect(emitted.at(-1)).toEqual({ 'first-key': 'new' })
  })

  it('removes a row by emitting a fresh object without that entry', async () => {
    const initialModel = {
      keep: 'yes',
      drop: 'no',
    }
    const { wrapper, emitted } = mountKeyValueField(initialModel)

    const removeButtons = wrapper.findAll('[data-testid="key-value-remove"]')
    await removeButtons[1]!.trigger('click')
    await flush()

    expect(emitted.at(-1)).toEqual({ keep: 'yes' })
    expect(emitted.at(-1)).not.toBe(initialModel)
  })

  it('keeps an empty-key row when a sanitized echo arrives after multiple ticks', async () => {
    const wrapper = mount(WorkflowWizardKeyValueField, {
      props: {
        modelValue: { 'X-Trace': '1' },
      },
      global: {
        components: {
          UInput: UInputStub,
          UButton: UButtonStub,
        },
      },
    })

    await wrapper.find('[data-testid="key-value-add"]').trigger('click')
    await flush()

    expect(wrapper.findAll('[data-testid="key-value-key"]')).toHaveLength(2)

    await nextTick()
    await nextTick()
    await Promise.resolve()
    await wrapper.setProps({
      modelValue: { 'X-Trace': '1' },
    })
    await flush()

    expect(wrapper.findAll('[data-testid="key-value-key"]')).toHaveLength(2)
    expect((wrapper.findAll('[data-testid="key-value-key"]')[1]!.element as HTMLInputElement).value).toBe('')
  })

  it('patches rows when a key is added externally', async () => {
    const wrapper = mount(WorkflowWizardKeyValueField, {
      props: {
        modelValue: { A: '1', B: '2' },
      },
      global: {
        components: {
          UInput: UInputStub,
          UButton: UButtonStub,
        },
      },
    })

    const valueInputsBefore = wrapper.findAll('[data-testid="key-value-value"]')
    expect((valueInputsBefore[0]!.element as HTMLInputElement).value).toBe('1')
    expect((valueInputsBefore[1]!.element as HTMLInputElement).value).toBe('2')

    await wrapper.setProps({
      modelValue: { A: '1', B: '2', C: '3' },
    })
    await flush()

    const keyInputs = wrapper.findAll('[data-testid="key-value-key"]')
    const valueInputs = wrapper.findAll('[data-testid="key-value-value"]')
    expect(keyInputs).toHaveLength(3)
    expect((valueInputs[0]!.element as HTMLInputElement).value).toBe('1')
    expect((valueInputs[1]!.element as HTMLInputElement).value).toBe('2')
    expect((valueInputs[2]!.element as HTMLInputElement).value).toBe('3')
  })

  it('patches rows when keys are removed externally', async () => {
    const wrapper = mount(WorkflowWizardKeyValueField, {
      props: {
        modelValue: { A: '1', B: '2' },
      },
      global: {
        components: {
          UInput: UInputStub,
          UButton: UButtonStub,
        },
      },
    })

    await wrapper.setProps({
      modelValue: { A: '1' },
    })
    await flush()

    const keyInputs = wrapper.findAll('[data-testid="key-value-key"]')
    expect(keyInputs).toHaveLength(1)
    expect((keyInputs[0]!.element as HTMLInputElement).value).toBe('A')
  })

  it('reacts to in-place modelValue mutations with deep watch', async () => {
    const model = reactive({ 'X-A': '1' })

    const wrapper = mount(WorkflowWizardKeyValueField, {
      props: {
        modelValue: model,
      },
      global: {
        components: {
          UInput: UInputStub,
          UButton: UButtonStub,
        },
      },
    })

    model['X-A'] = '2'
    await flush()

    const valueInput = wrapper.find('[data-testid="key-value-value"]')
    expect((valueInput.element as HTMLInputElement).value).toBe('2')
  })

  it('rebuilds rows when modelValue changes to unrelated external data', async () => {
    const wrapper = mount(WorkflowWizardKeyValueField, {
      props: {
        modelValue: { local: 'only' },
      },
      global: {
        components: {
          UInput: UInputStub,
          UButton: UButtonStub,
        },
      },
    })

    await wrapper.find('[data-testid="key-value-add"]').trigger('click')
    await flush()
    expect(wrapper.findAll('[data-testid="key-value-key"]')).toHaveLength(2)

    await wrapper.setProps({
      modelValue: { 'X-A': '1' },
    })
    await flush()

    const keyInputs = wrapper.findAll('[data-testid="key-value-key"]')
    expect(keyInputs).toHaveLength(1)
    expect((keyInputs[0]!.element as HTMLInputElement).value).toBe('X-A')
    expect((wrapper.findAll('[data-testid="key-value-value"]')[0]!.element as HTMLInputElement).value).toBe('1')
  })

  it('preserves __proto__ as an own emitted key', async () => {
    const { wrapper, emitted } = mountKeyValueField()

    await wrapper.find('[data-testid="key-value-add"]').trigger('click')
    await flush()

    const keyInputs = wrapper.findAll('[data-testid="key-value-key"]')
    const valueInputs = wrapper.findAll('[data-testid="key-value-value"]')
    await keyInputs[0]!.setValue('__proto__')
    await valueInputs[0]!.setValue('polluted')
    await flush()

    const record = emitted.at(-1)!
    expect(Object.hasOwn(record, '__proto__')).toBe(true)
    expect(Object.getOwnPropertyDescriptor(record, '__proto__')?.value).toBe('polluted')
  })
})

describe('workflowWizardField keyValue wiring', () => {
  it('forwards keyValue updates through update:modelValue', async () => {
    const input: InputConfig = {
      field: 'additionalRequestHeaders',
      type: 'keyValue',
    }
    const updates: unknown[] = []

    const wrapper = mount(WorkflowWizardField, {
      props: {
        input,
        'modelValue': {},
        'effects': {},
        'isBusy': false,
        'onUpdate:modelValue': (value: unknown) => {
          updates.push(value)
          wrapper.setProps({ modelValue: value })
        },
      },
      global: {
        stubs: {
          UAlert: true,
          USkeleton: true,
        },
        components: {
          UFormField: UFormFieldStub,
          WorkflowWizardKeyValueField,
          UInput: UInputStub,
          UButton: UButtonStub,
        },
      },
    })

    await wrapper.find('[data-testid="key-value-add"]').trigger('click')
    await flush()

    const keyInput = wrapper.find('[data-testid="key-value-key"]')
    const valueInput = wrapper.find('[data-testid="key-value-value"]')
    await keyInput.setValue('Authorization')
    await valueInput.setValue('Bearer token')
    await flush()

    expect(updates.at(-1)).toEqual({ Authorization: 'Bearer token' })
  })
})
