/** One version and the `@altafusion/*` packages installed at it. */
export interface PackageVersionGroup {
  version: string
  names: string[]
}

export interface PackageVersionSummary {
  count: number
  /** Newest-first is not assumed: groups are ordered by how many packages share the version, then by version text. */
  groups: PackageVersionGroup[]
  /** True when every package is on the same version, so the UI can say it once. */
  uniform: boolean
}

/** Groups `{ '@altafusion/shell': '0.6.3', ... }` by version, with short names (the scope dropped) sorted inside each group. */
export function summarizePackageVersions(packages: Record<string, string> = {}): PackageVersionSummary {
  const byVersion = new Map<string, string[]>()
  for (const [name, version] of Object.entries(packages)) {
    const names = byVersion.get(version) ?? []
    names.push(name.replace(/^@altafusion\//, ''))
    byVersion.set(version, names)
  }
  const groups = [
    ...byVersion.entries(),
  ]
    .map(([version, names]) => ({
      version,
      names: names.sort(),
    }))
    .sort((a, b) => b.names.length - a.names.length || b.version.localeCompare(a.version))
  return {
    count: Object.keys(packages).length,
    groups,
    uniform: groups.length === 1,
  }
}
