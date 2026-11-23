import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LocalStorageRecipeRepository } from './recipeRepository'

const WORKFLOW_ID = 'test-workflow'
const STORAGE_KEY = `workflow-recipes:${WORKFLOW_ID}`

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})

describe('localStorageRecipeRepository', () => {
  const repository = new LocalStorageRecipeRepository()

  it('starts empty when nothing is stored', async () => {
    expect(await repository.list(WORKFLOW_ID)).toEqual([])
  })

  it('saves a new recipe and lists it', async () => {
    const saved = await repository.save(WORKFLOW_ID, {
      name: 'Staging Web App',
      description: 'Static site preset',
      context: { workloadType: 'static-site', deploymentName: 'demo' },
    })

    expect(saved.name).toBe('Staging Web App')
    expect(saved.description).toBe('Static site preset')
    expect(saved.workflowId).toBe(WORKFLOW_ID)
    expect(saved.context).toEqual({ workloadType: 'static-site', deploymentName: 'demo' })
    expect(saved.updatedAt).toBeTruthy()

    const listed = await repository.list(WORKFLOW_ID)
    expect(listed).toHaveLength(1)
    expect(listed[0]).toEqual(saved)
  })

  it('upserts by name within a workflow', async () => {
    const first = await repository.save(WORKFLOW_ID, {
      name: 'My Recipe',
      context: { mode: 'github' },
    })
    const second = await repository.save(WORKFLOW_ID, {
      name: 'My Recipe',
      description: 'Updated',
      context: { mode: 'docker', image: 'artifactory/demo:latest' },
    })

    expect(second.id).toBe(first.id)
    expect(second.description).toBe('Updated')
    expect(second.context).toEqual({ mode: 'docker', image: 'artifactory/demo:latest' })
    expect(second.updatedAt >= first.updatedAt).toBe(true)

    const listed = await repository.list(WORKFLOW_ID)
    expect(listed).toHaveLength(1)
    expect(listed[0]?.name).toBe('My Recipe')
  })

  it('scopes recipes per workflow id', async () => {
    await repository.save(WORKFLOW_ID, {
      name: 'A',
      context: { x: 1 },
    })
    await repository.save('other-workflow', {
      name: 'B',
      context: { y: 2 },
    })

    expect(await repository.list(WORKFLOW_ID)).toHaveLength(1)
    expect(await repository.list('other-workflow')).toHaveLength(1)
  })

  it('gets a recipe by id', async () => {
    const saved = await repository.save(WORKFLOW_ID, {
      name: 'Lookup',
      context: { z: 3 },
    })
    const found = await repository.get(WORKFLOW_ID, saved.id)
    expect(found).toEqual(saved)
    expect(await repository.get(WORKFLOW_ID, 'missing')).toBeUndefined()
  })

  it('removes a recipe by id', async () => {
    const saved = await repository.save(WORKFLOW_ID, { name: 'Delete Me', context: {} })
    await repository.remove(WORKFLOW_ID, saved.id)
    expect(await repository.list(WORKFLOW_ID)).toEqual([])
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify({ recipes: [] }))
  })

  it('throws when remove cannot write to storage', async () => {
    const saved = await repository.save(WORKFLOW_ID, { name: 'Delete Me', context: {} })
    const setItem = vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    try {
      await expect(repository.remove(WORKFLOW_ID, saved.id)).rejects.toThrow(/Could not remove recipe/)
      expect(await repository.list(WORKFLOW_ID)).toHaveLength(1)
    } finally {
      setItem.mockRestore()
    }
  })

  it('returns an empty list when storage is corrupt', async () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(await repository.list(WORKFLOW_ID)).toEqual([])
  })
})
