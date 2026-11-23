import type { StepConfig } from '../types/workflow'
import { describe, expect, it } from 'vitest'
import { stepHasRenderableContent, stepShouldWarnEmpty } from './stepContent'

function minimalStep(overrides: Partial<StepConfig> = {}): StepConfig {
  return {
    id: 'only',
    title: 'Only',
    interactions: {
      transitions: [
        { target: '/done' },
      ],
    },
    ...overrides,
  }
}

describe('stepHasRenderableContent', () => {
  it('returns true when there are visible inputs', () => {
    const step = minimalStep({
      interactions: {
        inputs: [
          { field: 'name', type: 'text' },
        ],
        transitions: [
          { target: '/done' },
        ],
      },
    })
    expect(stepHasRenderableContent(step, [
      { field: 'name', type: 'text' },
    ])).toBe(true)
  })

  it('returns true when there are actions', () => {
    const step = minimalStep({
      interactions: {
        actions: [
          { id: 'go', label: 'Go' },
        ],
        transitions: [
          { target: '/done' },
        ],
      },
    })
    expect(stepHasRenderableContent(step, [])).toBe(true)
  })

  it('returns false when there are no visible inputs or actions', () => {
    const step = minimalStep({
      interactions: {
        inputs: [
          { field: 'hidden', type: 'text', when: 'false' },
        ],
        transitions: [
          { target: '/done' },
        ],
      },
    })
    expect(stepHasRenderableContent(step, [])).toBe(false)
  })

  it('returns true when the only content is a footer note', () => {
    const step = minimalStep({
      footer: { note: 'Done' },
    })
    expect(stepHasRenderableContent(step, [])).toBe(true)
  })
})

describe('stepShouldWarnEmpty', () => {
  it('returns false for a terminal step declaring no inputs and no actions', () => {
    const step = minimalStep({
      interactions: { transitions: [] },
    })
    expect(stepShouldWarnEmpty(step, [])).toBe(false)
  })

  it('returns true when inputs are declared but none are visible and there is a transition', () => {
    const step = minimalStep({
      interactions: {
        inputs: [
          { field: 'hidden', type: 'text', when: 'false' },
        ],
        transitions: [
          { target: '/done' },
        ],
      },
    })
    expect(stepShouldWarnEmpty(step, [])).toBe(true)
  })

  it('returns true when inputs are declared but none are visible and the step is terminal', () => {
    const step = minimalStep({
      interactions: {
        inputs: [
          { field: 'hidden', type: 'text', when: 'false' },
        ],
        transitions: [],
      },
    })
    expect(stepShouldWarnEmpty(step, [])).toBe(true)
  })

  it('returns true when there are no inputs or actions but there is a transition', () => {
    const step = minimalStep({
      interactions: {
        transitions: [
          { target: '/done' },
        ],
      },
    })
    expect(stepShouldWarnEmpty(step, [])).toBe(true)
  })

  it('returns false when there are visible inputs', () => {
    const step = minimalStep({
      interactions: {
        inputs: [
          { field: 'name', type: 'text' },
        ],
        transitions: [
          { target: '/done' },
        ],
      },
    })
    expect(stepShouldWarnEmpty(step, [
      { field: 'name', type: 'text' },
    ])).toBe(false)
  })

  it('returns false for a terminal step whose only content is footer.note', () => {
    const step = minimalStep({
      footer: { note: 'Done' },
      interactions: { transitions: [] },
    })
    expect(stepShouldWarnEmpty(step, [])).toBe(false)
  })
})
