import type { InputConfig, StepGroupConfig } from '../types/workflow'
import { describe, expect, it } from 'vitest'
import { partitionInputGroups } from './partitionInputGroups'

function text(field: string, group?: string): InputConfig {
  return {
    field,
    type: 'text',
    ...(group
      ? { group }
      : {}),
  }
}

const groups: StepGroupConfig[] = [
  { id: 'source', title: 'Source Details' },
  { id: 'runtime', title: 'Runtime Configuration' },
]

describe('partitionInputGroups', () => {
  it('returns all inputs as ungrouped when every input lacks a group', () => {
    const inputs = [
      text('name'),
      text('note'),
    ]

    expect(partitionInputGroups(inputs, groups)).toEqual({
      ungrouped: inputs,
      groups: [],
    })
  })

  it('orders grouped output by groups declaration, not input order', () => {
    const inputs = [
      text('runtimeField', 'runtime'),
      text('name'),
      text('sourceField', 'source'),
    ]

    expect(partitionInputGroups(inputs, groups)).toEqual({
      ungrouped: [
        text('name'),
      ],
      groups: [
        {
          group: groups[0],
          inputs: [
            text('sourceField', 'source'),
          ],
        },
        {
          group: groups[1],
          inputs: [
            text('runtimeField', 'runtime'),
          ],
        },
      ],
    })
  })

  it('omits groups with zero visible inputs', () => {
    const inputs = [
      text('name'),
      text('sourceField', 'source'),
    ]

    expect(partitionInputGroups(inputs, groups)).toEqual({
      ungrouped: [
        text('name'),
      ],
      groups: [
        {
          group: groups[0],
          inputs: [
            text('sourceField', 'source'),
          ],
        },
      ],
    })
  })

  it('treats inputs referencing undeclared group ids as ungrouped', () => {
    const inputs = [
      text('orphan', 'missing'),
      text('name'),
    ]

    expect(partitionInputGroups(inputs, groups)).toEqual({
      ungrouped: inputs,
      groups: [],
    })
  })

  it('passes all inputs through ungrouped when no groups are declared', () => {
    const inputs = [
      text('name'),
      text('grouped', 'source'),
    ]

    expect(partitionInputGroups(inputs)).toEqual({
      ungrouped: inputs,
      groups: [],
    })
    expect(partitionInputGroups(inputs, [])).toEqual({
      ungrouped: inputs,
      groups: [],
    })
  })

  it('does not mutate the inputs array', () => {
    const inputs = [
      text('name'),
      text('sourceField', 'source'),
    ]
    const snapshot = [...inputs]

    partitionInputGroups(inputs, groups)

    expect(inputs).toEqual(snapshot)
  })
})
