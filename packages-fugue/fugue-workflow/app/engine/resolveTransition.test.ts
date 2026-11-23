import type { HandlerRegistry, StepConfig } from '../types/workflow'
import { describe, expect, it, vi } from 'vitest'
import { interpolateTransitionTarget } from './interpolateTransitionTarget'
import { resolveTransition } from './resolveTransition'

const step: StepConfig = {
  id: 'workload',
  title: 'Workload',
  interactions: {
    transitions: [
      { when: 'mode == \'existing-group\'', target: 'group-picker' },
      { when: 'needsAisGate', target: 'ais-gate' },
      { target: 'configure' },
      { on: 'submit.success', target: '/deploy/{deploymentId}/details' },
    ],
  },
}

describe('interpolateTransitionTarget', () => {
  it('replaces context tokens with URI-encoded path segments', () => {
    expect(
      interpolateTransitionTarget('/deploy/{deploymentId}/details', { deploymentId: 'dep-1' }),
    ).toBe('/deploy/dep-1/details')
    expect(
      interpolateTransitionTarget('/deploy/{deploymentId}/details', { deploymentId: 'dep/with/slash' }),
    ).toBe('/deploy/dep%2Fwith%2Fslash/details')
  })

  it('throws when a referenced context key is missing or empty', () => {
    expect(() =>
      interpolateTransitionTarget('/deploy/{deploymentId}/details', {}),
    ).toThrow(/missing context value for "deploymentId"/)
    expect(() =>
      interpolateTransitionTarget('/deploy/{deploymentId}/details', { deploymentId: '' }),
    ).toThrow(/missing context value for "deploymentId"/)
  })

  it('returns the target unchanged when it has no tokens', () => {
    expect(interpolateTransitionTarget('configure', {})).toBe('configure')
  })
})

describe('resolveTransition', () => {
  it('picks the first transition whose DSL guard passes', () => {
    expect(resolveTransition(step, { mode: 'existing-group' }, undefined, {})).toBe('group-picker')
    expect(resolveTransition(step, { mode: 'new-service' }, undefined, {})).toBe('configure')
  })

  it('uses registry guards when the when value is a handler id', () => {
    const registry: HandlerRegistry = {
      guards: {
        needsAisGate: ctx => ctx.enableAis === true,
      },
    }

    expect(resolveTransition(step, { enableAis: true }, undefined, registry)).toBe('ais-gate')
    expect(resolveTransition(step, { enableAis: false }, undefined, registry)).toBe('configure')
  })

  it('does not treat inherited Object.prototype keys as registry guards', () => {
    expect(resolveTransition(step, {}, undefined, {})).toBe('configure')
  })

  it('requires a matching event for transitions with on', () => {
    expect(resolveTransition(step, {}, undefined, {})).toBe('configure')
    expect(
      resolveTransition(step, { deploymentId: 'dep-1' }, 'submit.success', {}),
    ).toBe('/deploy/dep-1/details')
    expect(resolveTransition(step, {}, 'other.event', {})).toBeUndefined()
  })

  it('throws when a matched dynamic transition has no registered handler', () => {
    const eventStep: StepConfig = {
      id: 'configure',
      title: 'Configure',
      interactions: {
        transitions: [
          { on: 'submit.success', dynamic: 'missingHandler' },
        ],
      },
    }

    expect(() => resolveTransition(eventStep, {}, 'submit.success', {})).toThrow(
      /no transition handler "missingHandler"/,
    )
  })

  it('calls dynamic handlers with context', () => {
    const dynamic = vi.fn(() => 'external')
    const registry: HandlerRegistry = {
      transitions: { routeOut: dynamic },
    }
    const dynamicStep: StepConfig = {
      id: 'x',
      title: 'X',
      interactions: {
        transitions: [
          { dynamic: 'routeOut' },
        ],
      },
    }

    expect(resolveTransition(dynamicStep, { deploymentId: '1' }, undefined, registry)).toBe('external')
    expect(dynamic).toHaveBeenCalledWith({ deploymentId: '1' })
  })
})
