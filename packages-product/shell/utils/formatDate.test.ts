import { describe, expect, it } from 'vitest'
import { formatDate } from './formatDate'

describe('formatDate', () => {
  it('formats a Date object', () => {
    const date = new Date(2025, 2, 15)
    expect(formatDate(date)).toMatch(/Mar\s+15,\s+2025/)
  })

  it('formats a date string', () => {
    const result = formatDate('2025-01-15')
    expect(result).toMatch(/Jan|15|2025/)
    expect(typeof result).toBe('string')
  })
})
