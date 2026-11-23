import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { useWorkflowContext } from './useWorkflowContext'

function storageKey(workflowId: string): string {
  return `workflow:${workflowId}`
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})

describe('useWorkflowContext persistence', () => {
  it('round-trips context and maxVisitedStepId through localStorage', async () => {
    const first = useWorkflowContext('persist-roundtrip', { version: 2, persist: true })
    first.set('mode', 'upload')
    first.setMaxVisitedStepId('security')
    await nextTick()

    const raw = localStorage.getItem(storageKey('persist-roundtrip'))
    expect(raw).toBeTruthy()
    expect(JSON.parse(raw!)).toEqual({
      version: 2,
      context: { mode: 'upload' },
      maxVisitedStepId: 'security',
    })

    setActivePinia(createPinia())
    const restored = useWorkflowContext('persist-roundtrip', { version: 2, persist: true })
    expect(restored.state.value).toEqual({ mode: 'upload' })
    expect(restored.maxVisitedStepId.value).toBe('security')
  })

  it('drops context and frontier on version mismatch', () => {
    localStorage.setItem(storageKey('persist-version'), JSON.stringify({
      version: 1,
      context: { mode: 'upload' },
      maxVisitedStepId: 'review',
    }))

    const store = useWorkflowContext('persist-version', { version: 2, persist: true })
    expect(store.state.value).toEqual({})
    expect(store.maxVisitedStepId.value).toBeUndefined()
  })

  it('clears storage on reset', async () => {
    const store = useWorkflowContext('persist-reset', { version: 1, persist: true })
    store.set('name', 'demo')
    store.setMaxVisitedStepId('review')
    await nextTick()
    expect(localStorage.getItem(storageKey('persist-reset'))).toBeTruthy()

    store.reset()
    await nextTick()

    expect(store.state.value).toEqual({})
    expect(store.maxVisitedStepId.value).toBeUndefined()
    expect(localStorage.getItem(storageKey('persist-reset'))).toBeNull()
  })

  it('omits maxVisitedStepId from storage when unset', async () => {
    const store = useWorkflowContext('persist-no-frontier', { version: 1, persist: true })
    store.set('mode', 'github')
    await nextTick()

    expect(JSON.parse(localStorage.getItem(storageKey('persist-no-frontier'))!))
      .toEqual({
        version: 1,
        context: { mode: 'github' },
      })
  })

  it('persists maxVisitedStepId when context is empty', async () => {
    const store = useWorkflowContext('persist-frontier-only', { version: 1, persist: true })
    store.setMaxVisitedStepId('security')
    await nextTick()

    expect(JSON.parse(localStorage.getItem(storageKey('persist-frontier-only'))!))
      .toEqual({ version: 1, context: {}, maxVisitedStepId: 'security' })
  })

  it('persists an empty-string maxVisitedStepId', async () => {
    const store = useWorkflowContext('persist-empty-step-id', { version: 1, persist: true })
    store.set('mode', 'github')
    store.setMaxVisitedStepId('')
    await nextTick()

    expect(JSON.parse(localStorage.getItem(storageKey('persist-empty-step-id'))!))
      .toEqual({
        version: 1,
        context: { mode: 'github' },
        maxVisitedStepId: '',
      })
  })
})
