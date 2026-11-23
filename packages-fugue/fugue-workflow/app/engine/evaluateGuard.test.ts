import { describe, expect, it } from 'vitest'
import { evaluateGuard, evaluateWhen } from './evaluateGuard'

describe('evaluateGuard', () => {
  const ctx = {
    mode: 'existing-group',
    enableAisTiers: true,
    count: 3,
    active: false,
  }

  it('compares strings with == and !=', () => {
    expect(evaluateGuard('mode == \'existing-group\'', ctx)).toBe(true)
    expect(evaluateGuard('mode == \'new-service\'', ctx)).toBe(false)
    expect(evaluateGuard('mode != \'new-service\'', ctx)).toBe(true)
  })

  it('resolves unknown identifiers to undefined', () => {
    expect(evaluateGuard('missing == true', ctx)).toBe(false)
    expect(evaluateGuard('!missing', ctx)).toBe(true)
  })

  it('supports boolean and numeric literals', () => {
    expect(evaluateGuard('enableAisTiers == true', ctx)).toBe(true)
    expect(evaluateGuard('count == 3', ctx)).toBe(true)
    expect(evaluateGuard('active == false', ctx)).toBe(true)
  })

  it('supports negative number literals', () => {
    expect(evaluateGuard('amount == -1', { amount: -1 })).toBe(true)
    expect(evaluateGuard('amount == -1', { amount: 1 })).toBe(false)
    expect(evaluateGuard('amount != -2.5', { amount: -1 })).toBe(true)
  })

  it('resolves dotted context keys as a single flat identifier', () => {
    const dotCtx = { 'disclosureTier.selected': 'high' }
    expect(evaluateGuard('disclosureTier.selected == \'high\'', dotCtx)).toBe(true)
    expect(evaluateGuard('disclosureTier.selected == \'low\'', dotCtx)).toBe(false)
  })

  it('combines clauses with && and ||', () => {
    expect(evaluateGuard('enableAisTiers && mode == \'existing-group\'', ctx)).toBe(true)
    expect(evaluateGuard('enableAisTiers && mode == \'new-service\'', ctx)).toBe(false)
    expect(evaluateGuard('mode == \'new-service\' || enableAisTiers', ctx)).toBe(true)
    expect(evaluateGuard('true || false', ctx)).toBe(true)
    expect(evaluateGuard('false || true', ctx)).toBe(true)
  })

  it('applies unary ! and parentheses', () => {
    expect(evaluateGuard('!active', ctx)).toBe(true)
    expect(evaluateGuard('!(mode == \'existing-group\')', ctx)).toBe(false)
    expect(evaluateGuard('enableAisTiers && !active', ctx)).toBe(true)
  })

  it('returns false for malformed expressions', () => {
    expect(evaluateGuard('', ctx)).toBe(false)
    expect(evaluateGuard('mode ===', ctx)).toBe(false)
    expect(evaluateGuard('mode @ value', ctx)).toBe(false)
    expect(evaluateGuard('mode ==', ctx)).toBe(false)
    expect(evaluateGuard('! ==', ctx)).toBe(false)
    expect(evaluateGuard('(mode == \'existing-group\'', ctx)).toBe(false)
  })

  it('supports the null literal', () => {
    expect(evaluateGuard('null == null', ctx)).toBe(true)
    expect(evaluateGuard('mode == null', ctx)).toBe(false)
  })

  it('parses escaped characters inside string literals', () => {
    expect(evaluateGuard('name == \'O\\\'Reilly\'', { name: 'O\'Reilly' })).toBe(true)
    expect(evaluateGuard('path == "a\\\\b"', { path: 'a\\b' })).toBe(true)
  })

  // multiselect/keyValue store arrays and plain objects; the guard DSL has no collection
  // literals or membership operators, so authors cannot express "includes X" here — pin
  // that limitation so future YAML does not assume == works on those values.
  it('cannot meaningfully compare multiselect or keyValue values with ==', () => {
    const ctx = {
      allowedAdGroupIds: ['grp-1'],
      additionalRequestHeaders: { 'X-Custom': 'alpha' },
    }

    expect(evaluateGuard('allowedAdGroupIds == \'grp-1\'', ctx)).toBe(false)
    expect(evaluateGuard('additionalRequestHeaders == \'X-Custom\'', ctx)).toBe(false)
    expect(evaluateGuard('allowedAdGroupIds == allowedAdGroupIds', ctx)).toBe(true)
    expect(evaluateGuard('allowedAdGroupIds', { allowedAdGroupIds: [] })).toBe(true)
    expect(evaluateGuard('additionalRequestHeaders', { additionalRequestHeaders: {} })).toBe(true)
  })

  it('shows security inputs when projectId is absent, null, or empty', () => {
    expect(evaluateGuard('!projectId', {})).toBe(true)
    expect(evaluateGuard('!projectId', { projectId: undefined })).toBe(true)
    expect(evaluateGuard('!projectId', { projectId: null })).toBe(true)
    expect(evaluateGuard('!projectId', { projectId: '' })).toBe(true)
  })

  it('hides security inputs when projectId has a value', () => {
    expect(evaluateGuard('!projectId', { projectId: 'proj-123' })).toBe(false)
  })

  it('does not treat projectId == empty string as absent when undefined', () => {
    expect(evaluateGuard('projectId == \'\'', {})).toBe(false)
    expect(evaluateGuard('projectId == \'\'', { projectId: undefined })).toBe(false)
    expect(evaluateGuard('projectId == \'\'', { projectId: '' })).toBe(true)
  })
})

describe('evaluateWhen', () => {
  it('runs a registered guard handler by id', () => {
    const registry = {
      guards: {
        isReady: (c: Record<string, unknown>) => c.ready === true,
      },
    }
    expect(evaluateWhen('isReady', { ready: true }, registry)).toBe(true)
    expect(evaluateWhen('isReady', { ready: false }, registry)).toBe(false)
  })

  it('falls back to the DSL when no handler matches', () => {
    expect(evaluateWhen('mode == \'a\'', { mode: 'a' }, { guards: {} })).toBe(true)
  })

  it('fails closed when a custom guard throws', () => {
    const registry = {
      guards: {
        boom: () => {
          throw new Error('kaboom')
        },
      },
    }
    expect(evaluateWhen('boom', {}, registry)).toBe(false)
  })
})
