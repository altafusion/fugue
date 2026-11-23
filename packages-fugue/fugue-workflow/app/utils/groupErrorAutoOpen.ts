export interface GroupErrorAutoOpenEntry {
  id: string
  collapsed: boolean
  hasError: boolean
}

/**
 * Applies rising-edge auto-open for collapsed wizard groups.
 * Copy-on-write: input records are never mutated.
 */
export function applyGroupErrorAutoOpen(
  groups: GroupErrorAutoOpenEntry[],
  openById: Record<string, boolean>,
  hadErrorById: Record<string, boolean>,
): { openById: Record<string, boolean>, hadErrorById: Record<string, boolean> } {
  let nextOpenById = openById
  let nextHadErrorById = hadErrorById

  for (const { id, collapsed, hasError } of groups) {
    if (collapsed && hasError && !hadErrorById[id]) {
      if (!nextOpenById[id]) {
        if (nextOpenById === openById)
          nextOpenById = { ...openById }
        nextOpenById[id] = true
      }
    }

    if (Boolean(hadErrorById[id]) !== hasError) {
      if (nextHadErrorById === hadErrorById)
        nextHadErrorById = { ...hadErrorById }
      nextHadErrorById[id] = hasError
    }
  }

  return { openById: nextOpenById, hadErrorById: nextHadErrorById }
}
