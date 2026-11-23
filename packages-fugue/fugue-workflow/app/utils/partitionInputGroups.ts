import type { InputConfig, StepGroupConfig } from '../types/workflow'

/**
 * Partition visible step inputs into ungrouped fields and non-empty group cards.
 * Group order follows `groups[]` declaration, not input order. Groups with no
 * visible inputs are omitted so callers never render an empty card.
 */
export function partitionInputGroups(
  inputs: InputConfig[],
  groups?: StepGroupConfig[],
): {
  ungrouped: InputConfig[]
  groups: Array<{ group: StepGroupConfig, inputs: InputConfig[] }>
} {
  if (!groups?.length) {
    return {
      ungrouped: [...inputs],
      groups: [],
    }
  }

  const declaredGroupIds = new Set(groups.map(group => group.id))
  const ungrouped: InputConfig[] = []
  const inputsByGroupId = new Map<string, InputConfig[]>(
    groups.map(group => [group.id, []]),
  )

  for (const input of inputs) {
    if (!input.group || !declaredGroupIds.has(input.group)) {
      ungrouped.push(input)
      continue
    }

    inputsByGroupId.get(input.group)?.push(input)
  }

  const grouped = groups
    .map(group => ({
      group,
      inputs: inputsByGroupId.get(group.id) ?? [],
    }))
    .filter(entry => entry.inputs.length > 0)

  return { ungrouped, groups: grouped }
}
