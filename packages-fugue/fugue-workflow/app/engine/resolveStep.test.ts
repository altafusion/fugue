import type { WorkflowConfig } from '../types/workflow'
import { describe, expect, it } from 'vitest'
import {
  downstreamProducedKeys,
  findStepById,
  isStepId,
  nearestSatisfiableStep,
  resolveNavigationTarget,
  resolveStep,
  stepRoute,
} from './resolveStep'

const config = {
  workflow: 'test-flow',
  version: 1,
  entry: 'context',
  basePath: '/deploy',
  steps: [
    {
      id: 'context',
      title: 'Context',
      interactions: {
        transitions: [
          { target: 'workload' },
        ],
      },
    },
    {
      id: 'workload',
      title: 'Workload',
      requires: ['mode'],
      interactions: {
        transitions: [
          { target: 'configure' },
        ],
      },
    },
    {
      id: 'configure',
      slug: 'review',
      title: 'Configure',
      requires: ['mode', 'workloadType'],
      interactions: {
        transitions: [
          { on: 'submit.success', target: 'done' },
        ],
      },
    },
  ],
} satisfies WorkflowConfig

describe('stepRoute', () => {
  it('routes the entry step to the bare basePath', () => {
    expect(stepRoute(config, config.steps[0]!)).toBe('/deploy')
  })

  it('derives non-entry routes from slug, defaulting to the step id', () => {
    expect(stepRoute(config, config.steps[1]!)).toBe('/deploy/workload')
    expect(stepRoute(config, config.steps[2]!)).toBe('/deploy/review')
  })

  it('strips leading slashes from slug or id segments', () => {
    const slugged = {
      ...config,
      steps: [
        ...config.steps,
        {
          id: 'extra',
          slug: '/nested',
          title: 'Extra',
          interactions: { transitions: [] },
        },
      ],
    } satisfies WorkflowConfig

    expect(stepRoute(slugged, slugged.steps[3]!)).toBe('/deploy/nested')
  })
})

describe('resolveStep', () => {
  it('matches the entry step at the basePath', () => {
    expect(resolveStep(config, '/deploy').id).toBe('context')
  })

  it('matches a step by its derived route path', () => {
    expect(resolveStep(config, '/deploy/workload').id).toBe('workload')
  })

  it('matches a step by an explicit slug override', () => {
    expect(resolveStep(config, '/deploy/review').id).toBe('configure')
  })

  it('tolerates a trailing slash', () => {
    expect(resolveStep(config, '/deploy/workload/').id).toBe('workload')
  })

  it('falls back to the entry step for unknown routes', () => {
    expect(resolveStep(config, '/deploy/unknown').id).toBe('context')
  })
})

describe('nearestSatisfiableStep', () => {
  it('returns the furthest step whose data requirements are met', () => {
    const has = (key: string) => key === 'mode'
    expect(nearestSatisfiableStep(config, has).id).toBe('workload')
  })

  it('falls back to entry when no step is satisfiable', () => {
    const has = (key: string) => key === 'workloadType'
    expect(nearestSatisfiableStep(config, has).id).toBe('context')
  })

  it('returns later steps when all upstream requirements are present', () => {
    const has = (key: string) => ['mode', 'workloadType'].includes(key)
    expect(nearestSatisfiableStep(config, has).id).toBe('configure')
  })

  it('walks derived transition order when steps are authored out of array order', () => {
    const reordered = {
      ...config,
      steps: [...config.steps].reverse(),
    } satisfies WorkflowConfig

    const has = (key: string) => key === 'mode'
    expect(nearestSatisfiableStep(reordered, has).id).toBe('workload')
  })
})

describe('downstreamProducedKeys', () => {
  const produced = {
    workflow: 'test-flow',
    version: 1,
    entry: 'source',
    basePath: '/deploy',
    stepper: { order: 'array' as const },
    steps: [
      {
        id: 'source',
        title: 'Source',
        interactions: { transitions: [] },
        output: {
          produces: ['source'],
        },
      },
      {
        id: 'workload',
        title: 'Workload',
        interactions: { transitions: [] },
        output: {
          produces: ['workloadType'],
        },
      },
      {
        id: 'configure',
        title: 'Configure',
        interactions: { transitions: [] },
        output: {
          produces: ['deploymentId', 'appId'],
        },
      },
    ],
  } satisfies WorkflowConfig

  it('returns keys produced by all later steps in array mode', () => {
    expect(downstreamProducedKeys(produced, 'source')).toEqual(['workloadType', 'deploymentId', 'appId'])
  })

  it('excludes the given step and upstream steps in array mode', () => {
    expect(downstreamProducedKeys(produced, 'workload')).toEqual(['deploymentId', 'appId'])
  })

  it('returns nothing for the last step', () => {
    expect(downstreamProducedKeys(produced, 'configure')).toEqual([])
  })

  it('returns nothing for an unknown step', () => {
    expect(downstreamProducedKeys(produced, 'nope')).toEqual([])
  })

  it('returns keys from graph descendants in transition mode', () => {
    const branching = {
      workflow: 'branch',
      version: 1,
      entry: 'start',
      basePath: '/deploy',
      steps: [
        {
          id: 'start',
          title: 'Start',
          interactions: {
            transitions: [
              { target: 'left' },
              { target: 'right' },
            ],
          },
          output: {
            produces: ['startKey'],
          },
        },
        {
          id: 'left',
          title: 'Left',
          interactions: {
            transitions: [
              { target: 'join' },
            ],
          },
          output: {
            produces: ['leftKey'],
          },
        },
        {
          id: 'right',
          title: 'Right',
          interactions: {
            transitions: [
              { target: 'join' },
            ],
          },
          output: {
            produces: ['rightKey'],
          },
        },
        {
          id: 'join',
          title: 'Join',
          interactions: {
            transitions: [
              { target: '/done' },
            ],
          },
          output: {
            produces: ['joinKey'],
          },
        },
      ],
    } satisfies WorkflowConfig

    expect(downstreamProducedKeys(branching, 'start')).toEqual(['leftKey', 'rightKey', 'joinKey'])
    expect(downstreamProducedKeys(branching, 'left')).toEqual(['joinKey'])
    expect(downstreamProducedKeys(branching, 'join')).toEqual([])
  })
})

describe('findStepById and navigation helpers', () => {
  it('finds steps by id', () => {
    expect(findStepById(config, 'configure')?.title).toBe('Configure')
  })

  it('distinguishes step ids from external paths', () => {
    expect(isStepId(config, 'workload')).toBe(true)
    expect(isStepId(config, '/apps/123')).toBe(false)
  })

  it('resolves step ids to routes and passes external paths through', () => {
    expect(resolveNavigationTarget(config, 'workload')).toBe('/deploy/workload')
    expect(resolveNavigationTarget(config, 'configure')).toBe('/deploy/review')
    expect(resolveNavigationTarget(config, '/apps/123')).toBe('/apps/123')
  })
})
