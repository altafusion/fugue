import type { WorkflowConfig } from '../types/workflow'
import { describe, expect, it } from 'vitest'
import {
  buildErrorSuccessorsMap,
  buildSuccessorsMap,
  computeGuaranteedAvailableKeys,
  deriveStepOrder,
  getDescendantStepIds,
  nextStepInOrder,
  reachableStepIds,
  reachableStepIdsIncludingErrors,
} from './orderSteps'

function step(id: string, targets: string[] = [], produces: string[] = []): WorkflowConfig['steps'][number] {
  return {
    id,
    title: id,
    interactions: {
      transitions: targets.length
        ? targets.map(target => ({ target }))
        : [
            { target: '/done' },
          ],
    },
    ...(produces.length
      ? {
          output: { produces },
        }
      : {}),
  }
}

describe('nextStepInOrder', () => {
  it('returns the next step in array order', () => {
    const config = {
      workflow: 'array',
      version: 1,
      entry: 'a',
      basePath: '/x',
      stepper: { order: 'array' as const },
      steps: [
        step('a'),
        step('b'),
        step('c'),
      ],
    } satisfies WorkflowConfig

    expect(nextStepInOrder(config, 'a')?.id).toBe('b')
    expect(nextStepInOrder(config, 'b')?.id).toBe('c')
    expect(nextStepInOrder(config, 'c')).toBeUndefined()
  })

  it('returns the next step in transition-derived order', () => {
    const config = {
      workflow: 'reorder',
      version: 1,
      entry: 'a',
      basePath: '/x',
      steps: [
        step('c', ['d']),
        step('a', ['b']),
        step('b', ['c']),
        step('d'),
      ],
    } satisfies WorkflowConfig

    expect(nextStepInOrder(config, 'a')?.id).toBe('b')
    expect(nextStepInOrder(config, 'b')?.id).toBe('c')
    expect(nextStepInOrder(config, 'd')).toBeUndefined()
  })

  it('returns undefined for an unknown step id', () => {
    const config = {
      workflow: 'array',
      version: 1,
      entry: 'a',
      basePath: '/x',
      stepper: { order: 'array' as const },
      steps: [
        step('a'),
        step('b'),
      ],
    } satisfies WorkflowConfig

    expect(nextStepInOrder(config, 'missing')).toBeUndefined()
  })
})

describe('deriveStepOrder', () => {
  it('returns the literal array order when mode is array', () => {
    const config = {
      workflow: 'array',
      version: 1,
      entry: 'a',
      basePath: '/x',
      stepper: { order: 'array' as const },
      steps: [
        step('c', ['d']),
        step('a', ['b']),
        step('b', ['c']),
        step('d'),
      ],
    } satisfies WorkflowConfig

    expect(deriveStepOrder(config).map(s => s.id)).toEqual(['c', 'a', 'b', 'd'])
  })

  it('defaults to transition mode and reorders by entry + transitions', () => {
    const config = {
      workflow: 'reorder',
      version: 1,
      entry: 'a',
      basePath: '/x',
      steps: [
        step('c', ['d']),
        step('a', ['b']),
        step('b', ['c']),
        step('d'),
      ],
    } satisfies WorkflowConfig

    expect(deriveStepOrder(config).map(s => s.id)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('orders a diamond graph topologically (joins after all predecessors)', () => {
    const config = {
      workflow: 'diamond',
      version: 1,
      entry: 'start',
      basePath: '/x',
      steps: [
        {
          id: 'start',
          title: 'start',
          interactions: {
            transitions: [
              { target: 'left' },
              { target: 'right' },
            ],
          },
        },
        step('left', ['join']),
        step('right', ['join']),
        step('join'),
      ],
    } satisfies WorkflowConfig

    expect(deriveStepOrder(config).map(s => s.id)).toEqual(['start', 'left', 'right', 'join'])
  })

  it('terminates on cycles with first-visit order winning', () => {
    const config = {
      workflow: 'cycle',
      version: 1,
      entry: 'a',
      basePath: '/x',
      steps: [
        step('a', ['b']),
        step('b', ['a', 'c']),
        step('c'),
      ],
    } satisfies WorkflowConfig

    expect(deriveStepOrder(config).map(s => s.id)).toEqual(['a', 'b', 'c'])
  })

  it('appends orphan steps in original array order after the reachable DFS', () => {
    const config = {
      workflow: 'orphan',
      version: 1,
      entry: 'a',
      basePath: '/x',
      steps: [
        step('a', ['b']),
        step('orphan1'),
        step('b'),
        step('orphan2'),
      ],
    } satisfies WorkflowConfig

    expect(deriveStepOrder(config).map(s => s.id)).toEqual(['a', 'b', 'orphan1', 'orphan2'])
  })

  it('ignores dynamic and external transition targets', () => {
    const config = {
      workflow: 'dynamic',
      version: 1,
      entry: 'a',
      basePath: '/x',
      steps: [
        {
          id: 'a',
          title: 'a',
          interactions: {
            transitions: [
              { target: 'b' },
              { dynamic: 'resolveNext' },
              { target: '/external' },
            ],
          },
        },
        step('b'),
      ],
    } satisfies WorkflowConfig

    expect(buildSuccessorsMap(config).get('a')).toEqual(['b'])
    expect(deriveStepOrder(config).map(s => s.id)).toEqual(['a', 'b'])
  })
})

describe('getDescendantStepIds', () => {
  it('returns suffix steps in array mode', () => {
    const config = {
      workflow: 'array',
      version: 1,
      entry: 'a',
      basePath: '/x',
      stepper: { order: 'array' as const },
      steps: [
        step('a'),
        step('b'),
        step('c'),
      ],
    } satisfies WorkflowConfig

    expect([
      ...getDescendantStepIds(config, 'a'),
    ]).toEqual(['b', 'c'])
  })

  it('returns graph descendants in transition mode', () => {
    const config = {
      workflow: 'graph',
      version: 1,
      entry: 'start',
      basePath: '/x',
      steps: [
        {
          id: 'start',
          title: 'start',
          interactions: {
            transitions: [
              { target: 'left' },
              { target: 'right' },
            ],
          },
        },
        step('left', ['join'], ['leftKey']),
        step('right', ['join'], ['rightKey']),
        step('join', [], ['joinKey']),
      ],
    } satisfies WorkflowConfig

    expect([
      ...getDescendantStepIds(config, 'start'),
    ].sort()).toEqual(['join', 'left', 'right'])
    expect([
      ...getDescendantStepIds(config, 'left'),
    ]).toEqual(['join'])
  })
})

describe('reachableStepIds', () => {
  it('collects all steps reachable from entry via static edges', () => {
    const config = {
      workflow: 'reach',
      version: 1,
      entry: 'a',
      basePath: '/x',
      steps: [
        step('a', ['b']),
        step('b'),
        step('orphan'),
      ],
    } satisfies WorkflowConfig

    expect([
      ...reachableStepIds(config),
    ].sort()).toEqual(['a', 'b'])
  })
})

describe('buildErrorSuccessorsMap / reachableStepIdsIncludingErrors', () => {
  it('returns onError step targets and excludes stay and external routes', () => {
    const config = {
      workflow: 'errors',
      version: 1,
      entry: 'a',
      basePath: '/x',
      steps: [
        {
          id: 'a',
          title: 'a',
          interactions: {
            actions: [
              {
                id: 'go',
                label: 'Go',
                effect: 'mutate',
                handler: 'save',
                onError: 'recover',
              },
              {
                id: 'stay',
                label: 'Stay',
                effect: 'mutate',
                handler: 'save',
                onError: 'stay',
              },
              {
                id: 'ext',
                label: 'Ext',
                effect: 'mutate',
                handler: 'save',
                onError: '/error',
              },
            ],
            transitions: [
              { target: '/done' },
            ],
          },
        },
        step('recover'),
      ],
    } satisfies WorkflowConfig

    expect(buildErrorSuccessorsMap(config).get('a')).toEqual(['recover'])
  })

  it('includes steps reachable only via onError, unlike reachableStepIds', () => {
    const config = {
      workflow: 'error-reach',
      version: 1,
      entry: 'start',
      basePath: '/x',
      steps: [
        {
          id: 'start',
          title: 'start',
          interactions: {
            actions: [
              {
                id: 'go',
                label: 'Go',
                effect: 'mutate',
                handler: 'save',
                onError: 'recover',
              },
            ],
            transitions: [
              { target: '/done' },
            ],
          },
        },
        step('recover'),
      ],
    } satisfies WorkflowConfig

    expect([
      ...reachableStepIds(config),
    ]).toEqual(['start'])
    expect([
      ...reachableStepIdsIncludingErrors(config),
    ].sort()).toEqual(['recover', 'start'])
  })

  it('appends onError-only targets as orphans rather than placing them after the error source', () => {
    const config = {
      workflow: 'error-order',
      version: 1,
      entry: 'start',
      basePath: '/x',
      steps: [
        {
          id: 'start',
          title: 'start',
          interactions: {
            actions: [
              {
                id: 'go',
                label: 'Go',
                effect: 'mutate',
                handler: 'save',
                onError: 'recover',
              },
            ],
            transitions: [
              { target: 'next' },
            ],
          },
        },
        step('next'),
        step('recover'),
      ],
    } satisfies WorkflowConfig

    expect(deriveStepOrder(config).map(s => s.id)).toEqual(['start', 'next', 'recover'])
  })
})

describe('computeGuaranteedAvailableKeys', () => {
  it('intersects keys from all paths at a join step', () => {
    const config = {
      workflow: 'join',
      version: 1,
      entry: 'start',
      basePath: '/x',
      context: {
        globals: ['globalKey'],
      },
      steps: [
        {
          id: 'start',
          title: 'start',
          interactions: {
            transitions: [
              { target: 'left' },
              { target: 'right' },
            ],
          },
          output: {
            produces: ['shared'],
          },
        },
        {
          id: 'left',
          title: 'left',
          interactions: {
            transitions: [
              { target: 'join' },
            ],
          },
          output: {
            produces: ['leftOnly'],
          },
        },
        {
          id: 'right',
          title: 'right',
          interactions: {
            transitions: [
              { target: 'join' },
            ],
          },
          output: {
            produces: ['rightOnly'],
          },
        },
        {
          id: 'join',
          title: 'join',
          interactions: {
            transitions: [
              { target: '/done' },
            ],
          },
        },
      ],
    } satisfies WorkflowConfig

    const guaranteed = computeGuaranteedAvailableKeys(config)
    expect([
      ...guaranteed.get('join')!,
    ].sort()).toEqual(['globalKey', 'shared'])
  })
})
