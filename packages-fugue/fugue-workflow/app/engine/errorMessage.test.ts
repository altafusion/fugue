import { describe, expect, it } from 'vitest'
import { RecoverableActionError } from './actionRecovery'
import { toErrorMessage } from './errorMessage'

describe('toErrorMessage', () => {
  it('returns message for Error', () => {
    expect(toErrorMessage(new Error('quota exceeded'))).toBe('quota exceeded')
  })

  it('returns message for RecoverableActionError without class prefix', () => {
    const message = toErrorMessage(new RecoverableActionError('archive expired', 'archive'))
    expect(message).toBe('archive expired')
    expect(message).not.toMatch(/^RecoverableActionError:/)
  })

  it('stringifies non-Error values', () => {
    expect(toErrorMessage('plain failure')).toBe('plain failure')
    expect(toErrorMessage({ code: 'E_FAIL' })).toBe('[object Object]')
  })
})
