import type { InputConfig } from '../types/workflow'
import { describe, expect, it } from 'vitest'
import { projectCompositeReads } from './projectCompositeReads'

function composite(reads?: Record<string, string>): InputConfig {
  return {
    field: 'sourceArchive',
    type: 'composite',
    component: 'sourceArchiveUpload',
    ...(reads
      ? { reads }
      : {}),
  }
}

describe('projectCompositeReads', () => {
  it('renames context keys to the keys the component asked for', () => {
    const projected = projectCompositeReads(
      composite({ workload: 'workloadType' }),
      { workloadType: 'static-site', deploymentName: 'demo' },
    )

    expect(projected).toEqual({ workload: 'static-site' })
  })

  it('projects nothing beyond the declared keys', () => {
    const projected = projectCompositeReads(
      composite({ workload: 'workloadType' }),
      { workloadType: 'static-site', secret: 'do-not-leak' },
    )

    expect(Object.keys(projected ?? {})).toEqual(['workload'])
  })

  it('keeps a declared key present but undefined when Context has no value yet', () => {
    const projected = projectCompositeReads(composite({ workload: 'workloadType' }), {})

    expect(projected).toEqual({ workload: undefined })
  })

  it('returns undefined when the input declares no reads', () => {
    expect(projectCompositeReads(composite(), { workloadType: 'static-site' })).toBeUndefined()
  })
})
