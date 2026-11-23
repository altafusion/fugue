import type { InputConfig } from '../types/workflow'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, ref } from 'vue'
import WorkflowWizardFieldList from './WorkflowWizardFieldList.vue'

const WorkflowWizardFieldStub = defineComponent({
  name: 'WorkflowWizardField',
  props: {
    input: { type: Object, required: true },
  },
  template: '<div class="workflow-wizard-field-stub" :data-field="input.field" />',
})

function makeInput(field: string): InputConfig {
  return { field, type: 'text', label: field }
}

function mountFieldList(inputs: InputConfig[], layout: 'stack' | 'columns' = 'stack') {
  return mount(WorkflowWizardFieldList, {
    props: {
      inputs,
      values: {},
      fieldErrors: {},
      fieldOptions: {},
      effects: {},
      isBusy: false,
      compositeContexts: {},
      layout,
    },
    global: {
      components: {
        WorkflowWizardField: WorkflowWizardFieldStub,
      },
    },
  })
}

beforeEach(() => {
  vi.stubGlobal('ref', ref)
  vi.stubGlobal('computed', computed)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('workflowWizardFieldList', () => {
  it('uses stack spacing by default', () => {
    const wrapper = mountFieldList([
      makeInput('a'),
      makeInput('b'),
    ])
    expect(wrapper.get('div').classes()).toContain('space-y-6')
    expect(wrapper.get('div').classes()).not.toContain('grid')
  })

  it('uses a two-column grid for columns layout', () => {
    const wrapper = mountFieldList([
      makeInput('a'),
      makeInput('b'),
    ], 'columns')
    const root = wrapper.get('div')
    expect(root.classes()).toContain('grid')
    expect(root.classes()).toContain('md:grid-cols-2')
    expect(root.classes()).toContain('items-start')
    expect(root.classes()).toContain('[&>*:only-child]:md:col-span-2')
  })

  it('renders a single field when only one input remains', () => {
    const wrapper = mountFieldList([
      makeInput('only'),
    ], 'columns')
    expect(wrapper.findAll('.workflow-wizard-field-stub')).toHaveLength(1)
    expect(wrapper.get('.workflow-wizard-field-stub').attributes('data-field')).toBe('only')
  })
})
