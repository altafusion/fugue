import { describe, expect, it } from 'vitest'
import { formatFieldLabel, joinFieldLabels, resolveInputLabel } from './formatFieldLabel'

describe('formatFieldLabel', () => {
  it('splits camelCase and kebab-case into title-cased words', () => {
    expect(formatFieldLabel('deploymentName')).toBe('Deployment Name')
    expect(formatFieldLabel('workloadType')).toBe('Workload Type')
    expect(formatFieldLabel('existing-group')).toBe('Existing Group')
    expect(formatFieldLabel('source')).toBe('Source')
  })
})

describe('resolveInputLabel', () => {
  it('prefers YAML label over derived field name', () => {
    expect(resolveInputLabel('authMode', 'Authentication Mode')).toBe('Authentication Mode')
    expect(resolveInputLabel('authMode')).toBe('Auth Mode')
    expect(resolveInputLabel('authMode', '  ')).toBe('Auth Mode')
  })
})

describe('joinFieldLabels', () => {
  it('joins with "and", using commas beyond two entries', () => {
    expect(joinFieldLabels([])).toBe('')
    expect(joinFieldLabels(['Source'])).toBe('Source')
    expect(joinFieldLabels(['Deployment Name', 'Workload Type']))
      .toBe('Deployment Name and Workload Type')
    expect(joinFieldLabels(['A', 'B', 'C'])).toBe('A, B and C')
  })
})
