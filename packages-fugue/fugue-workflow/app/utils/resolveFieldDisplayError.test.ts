import type { InputConfig } from '../types/workflow'
import { describe, expect, it } from 'vitest'
import { resolveDisplayFieldErrors, resolveFieldDisplayError } from './resolveFieldDisplayError'

describe('resolveFieldDisplayError', () => {
  const deploymentName: InputConfig = { field: 'deploymentName', type: 'text', required: true }
  const workloadType: InputConfig = { field: 'workloadType', type: 'tiles', required: true }

  it('prefers async validator errors over required feedback', () => {
    expect(resolveFieldDisplayError(
      deploymentName,
      {},
      { deploymentName: 'Name already taken' },
      true,
    )).toBe('Name already taken')
  })

  it('shows required feedback only after validation was attempted', () => {
    expect(resolveFieldDisplayError(deploymentName, {}, {}, false)).toBeUndefined()
    expect(resolveFieldDisplayError(deploymentName, {}, {}, true)).toBe('Deployment Name is required')
  })

  it('clears required feedback once the field has a value', () => {
    expect(resolveFieldDisplayError(
      workloadType,
      { workloadType: 'web-app' },
      {},
      true,
    )).toBeUndefined()
  })

  it('shows required feedback for empty keyValue after validation attempted', () => {
    const env: InputConfig = { field: 'env', type: 'keyValue', required: true }
    expect(resolveFieldDisplayError(env, { env: {} }, {}, true)).toBe('Env is required')
    expect(resolveFieldDisplayError(env, {
      env: { X: '1' },
    }, {}, true)).toBeUndefined()
  })

  it('builds a map for every visible input', () => {
    expect(resolveDisplayFieldErrors(
      [deploymentName, workloadType],
      { workloadType: 'web-app' },
      {},
      true,
    )).toEqual({
      deploymentName: 'Deployment Name is required',
      workloadType: undefined,
    })
  })
})
