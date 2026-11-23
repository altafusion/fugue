/**
 * Humanizes a field name for display: `deploymentName` → `Deployment Name`,
 * `existing-group` → `Existing Group`. Shared so the blocked-Continue hint names
 * fields exactly as their rendered labels do.
 */
export function formatFieldLabel(value: string): string {
  return value
    // Split camelCase (workloadType) as well as kebab-case (existing-group).
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[-\s]+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/** Prefer YAML `label`; otherwise humanize `field`. */
export function resolveInputLabel(field: string, label?: string): string {
  const trimmed = label?.trim()
  return trimmed || formatFieldLabel(field)
}

/** `['A']` → `A` · `['A','B']` → `A and B` · `['A','B','C']` → `A, B and C`. */
export function joinFieldLabels(labels: string[]): string {
  if (labels.length <= 1)
    return labels[0] ?? ''
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`
}
