import type { WorkflowConfig, WorkflowContext } from '../types/workflow'
import { describe, expect, it } from 'vitest'
import { cloneSerializableContext, collectRecipeContextKeys, isPresent, sanitizeRecipeContext } from './recipeContext'

const guidedLikeConfig: WorkflowConfig = {
  workflow: 'default-deploy-workflow',
  version: 1,
  entry: 'workload',
  basePath: '/deploy',
  context: {
    globals: ['user', 'projectId'],
  },
  recipes: {
    excludeKeys: [
      'user',
      'deploymentId',
      'appId',
      'deploymentType',
      'sourceArchive',
    ],
  },
  steps: [
    {
      id: 'workload',
      title: 'Workload',
      interactions: { transitions: [] },
      output: {
        produces: ['workloadType', 'deploymentName'],
      },
    },
    {
      id: 'link-project',
      title: 'Link to a Project',
      interactions: { transitions: [] },
      output: {
        produces: ['projectId'],
      },
    },
    {
      id: 'configure',
      title: 'Configure',
      interactions: {
        inputs: [
          { field: 'regions', type: 'composite', required: true },
        ],
        transitions: [],
      },
      output: {
        produces: ['deploymentId', 'appId'],
      },
    },
  ],
}

describe('collectRecipeContextKeys', () => {
  it('includes globals, step input fields, and every step produces key', () => {
    expect([
      ...collectRecipeContextKeys(guidedLikeConfig),
    ].sort()).toEqual([
      'appId',
      'deploymentId',
      'deploymentName',
      'projectId',
      'regions',
      'user',
      'workloadType',
    ])
  })
})

describe('sanitizeRecipeContext', () => {
  it('keeps declared keys with values', () => {
    expect(sanitizeRecipeContext(guidedLikeConfig, {
      projectId: '12701',
      workloadType: 'static-site',
      deploymentName: 'demo',
      regions: ['us-west-2'],
    })).toEqual({
      projectId: '12701',
      workloadType: 'static-site',
      deploymentName: 'demo',
      regions: ['us-west-2'],
    })
  })

  it('round-trips input-only fields not listed in produces', () => {
    expect(sanitizeRecipeContext(guidedLikeConfig, {
      workloadType: 'static-site',
      deploymentName: 'demo',
      regions: ['us-west-2'],
    })).toEqual({
      workloadType: 'static-site',
      deploymentName: 'demo',
      regions: ['us-west-2'],
    })
  })

  it('drops keys not declared by the workflow', () => {
    expect(sanitizeRecipeContext(guidedLikeConfig, {
      'link-project': '12701',
      'mysteryKey': 'drop-me',
      'workloadType': 'web-app',
    })).toEqual({
      workloadType: 'web-app',
    })
  })

  it('drops re-injected globals and run-specific handles even when declared', () => {
    expect(sanitizeRecipeContext(guidedLikeConfig, {
      user: { id: '1', name: 'Demo' },
      deploymentId: 'dep-1',
      appId: 'app-1',
      sourceArchive: { artifactId: 'a', uploadSessionId: 's', status: 'READY' },
      workloadType: 'web-app',
      deploymentName: 'demo',
    })).toEqual({
      workloadType: 'web-app',
      deploymentName: 'demo',
    })
  })

  it('template kind strips excludeKeys handles', () => {
    expect(sanitizeRecipeContext(guidedLikeConfig, {
      appId: 'app-1',
      deploymentId: 'dep-1',
      workloadType: 'static-site',
    }, 'template')).toEqual({
      workloadType: 'static-site',
    })
  })

  it('snapshot kind keeps appId and deploymentId', () => {
    expect(sanitizeRecipeContext(guidedLikeConfig, {
      appId: 'app-1',
      deploymentId: 'dep-1',
      workloadType: 'static-site',
    }, 'snapshot')).toEqual({
      appId: 'app-1',
      deploymentId: 'dep-1',
      workloadType: 'static-site',
    })
  })

  it('snapshot kind with no snapshotExcludeKeys strips nothing extra', () => {
    expect(sanitizeRecipeContext(guidedLikeConfig, {
      user: { id: '1', name: 'Demo' },
      appId: 'app-1',
      deploymentId: 'dep-1',
      workloadType: 'static-site',
    }, 'snapshot')).toEqual({
      user: { id: '1', name: 'Demo' },
      appId: 'app-1',
      deploymentId: 'dep-1',
      workloadType: 'static-site',
    })
  })

  it('snapshot kind applies snapshotExcludeKeys instead of excludeKeys', () => {
    const config: WorkflowConfig = {
      ...guidedLikeConfig,
      recipes: {
        excludeKeys: ['appId', 'deploymentId'],
        snapshotExcludeKeys: ['user'],
      },
    }
    expect(sanitizeRecipeContext(config, {
      user: { id: '1', name: 'Demo' },
      appId: 'app-1',
      deploymentId: 'dep-1',
      workloadType: 'static-site',
    }, 'snapshot')).toEqual({
      appId: 'app-1',
      deploymentId: 'dep-1',
      workloadType: 'static-site',
    })
  })

  it('drops undeclared keys under both template and snapshot kinds', () => {
    const input = {
      isFollowUpDeploy: true,
      workloadType: 'static-site',
    }
    expect(sanitizeRecipeContext(guidedLikeConfig, input, 'template')).toEqual({
      workloadType: 'static-site',
    })
    expect(sanitizeRecipeContext(guidedLikeConfig, input, 'snapshot')).toEqual({
      workloadType: 'static-site',
    })
  })

  it('returns a deep clone independent of the input object', () => {
    const input = { projectId: '12701', workloadType: 'static-site' }
    const sanitized = sanitizeRecipeContext(guidedLikeConfig, input)
    sanitized.projectId = 'mutated'
    expect(input.projectId).toBe('12701')
  })
})

describe('cloneSerializableContext', () => {
  it('returns a deep clone of plain data', () => {
    const input = {
      projectId: '12701',
      tags: ['a'],
    }
    expect(cloneSerializableContext(input)).toEqual(input)
    expect(cloneSerializableContext(input)).not.toBe(input)
  })

  it('round-trips multiselect and keyValue values unchanged', () => {
    const input: WorkflowContext = {
      allowedAdGroupIds: ['grp-1', 'grp-2'],
      additionalRequestHeaders: { 'X-Custom': 'alpha', 'Accept': 'application/json' },
    }
    expect(cloneSerializableContext(input)).toEqual(input)
    expect(cloneSerializableContext(input)).not.toBe(input)
  })

  it('throws when a value is not JSON-serializable', () => {
    const circular: WorkflowContext = { workloadType: 'web-app' }
    circular.self = circular
    expect(() => cloneSerializableContext(circular)).toThrow(/cannot be saved/i)
  })
})

describe('isPresent', () => {
  it('treats empty arrays and plain objects as absent', () => {
    expect(isPresent([])).toBe(false)
    expect(isPresent({})).toBe(false)
  })

  it('treats non-empty collections and scalar sentinels as present', () => {
    expect(isPresent(['a'])).toBe(true)
    expect(isPresent({ a: 'b' })).toBe(true)
    expect(isPresent(false)).toBe(true)
    expect(isPresent(0)).toBe(true)
  })

  it('treats non-plain objects as present even with no own enumerable keys', () => {
    expect(isPresent(new Date())).toBe(true)
    expect(isPresent(new Map())).toBe(true)
  })
})

describe('sanitizeRecipeContext empty collections', () => {
  const collectionConfig: WorkflowConfig = {
    workflow: 'collections',
    version: 1,
    entry: 'only',
    basePath: '/collections',
    steps: [
      {
        id: 'only',
        title: 'Only',
        interactions: {
          inputs: [
            {
              field: 'allowedAdGroupIds',
              type: 'multiselect',
              choices: ['a'],
            },
            { field: 'additionalRequestHeaders', type: 'keyValue' },
            { field: 'enabled', type: 'toggle' },
            { field: 'count', type: 'text' },
          ],
          transitions: [],
        },
      },
    ],
  }

  it('drops untouched multiselect and keyValue empty collections from saved recipes', () => {
    expect(sanitizeRecipeContext(collectionConfig, {
      allowedAdGroupIds: [],
      additionalRequestHeaders: {},
      enabled: false,
      count: 0,
    })).toEqual({
      enabled: false,
      count: 0,
    })
  })

  it('keeps non-empty multiselect and keyValue values', () => {
    expect(sanitizeRecipeContext(collectionConfig, {
      allowedAdGroupIds: ['grp-1'],
      additionalRequestHeaders: { 'X-Trace': '1' },
    })).toEqual({
      allowedAdGroupIds: ['grp-1'],
      additionalRequestHeaders: { 'X-Trace': '1' },
    })
  })
})
