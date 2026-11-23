import type { Recipe, RecipeRepository, RecipeWrite } from '#orchestrator'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import {
  flushShell,
  mountWorkflowWizardShell,
  teardownShellHarness,
} from '../test/mountWorkflowWizardShell'

const recipeHydrationConfig = {
  workflow: 'recipe-hydration',
  version: 1,
  entry: 'a',
  basePath: '/flow',
  stepper: { navigable: true, order: 'array' as const },
  steps: [
    {
      id: 'a',
      title: 'A',
      interactions: {
        inputs: [
          { field: 'name', type: 'text' as const, required: true },
        ],
        transitions: [
          { target: 'b' },
        ],
      },
      output: {
        produces: ['name'],
      },
    },
    {
      id: 'b',
      title: 'B',
      interactions: {
        inputs: [
          { field: 'region', type: 'text' as const },
        ],
        transitions: [],
      },
      output: {
        produces: ['region'],
      },
    },
  ],
}

function createFakeRepository(recipe: Recipe | undefined, rejectGet = false): RecipeRepository {
  return {
    list: async () => (recipe
      ? [recipe]
      : []),
    get: async () => {
      if (rejectGet)
        throw new Error('repository unavailable')
      return recipe
    },
    save: async (_workflowId: string, input: RecipeWrite) => ({
      id: 'saved',
      workflowId: recipeHydrationConfig.workflow,
      updatedAt: new Date().toISOString(),
      name: input.name,
      description: input.description,
      context: input.context,
    }),
    remove: async () => {},
  }
}

function expectStepperAndCard(wrapper: ReturnType<typeof mountWorkflowWizardShell>['wrapper'], present: boolean): void {
  expect(wrapper.find('[data-testid="stepper"]').exists()).toBe(present)
  expect(wrapper.find('[data-testid="step-card"]').exists()).toBe(present)
}

/** Wait until mount hydration finishes (success or failure). */
async function flushShellAfterHydration(wrapper: ReturnType<typeof mountWorkflowWizardShell>['wrapper']): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < 3000) {
    await flushShell()
    if (!wrapper.find('[data-testid="wizard-hydrating"]').exists())
      return
  }
  throw new Error('Wizard hydration did not finish')
}

describe('workflowWizardShell initial recipe hydration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  afterEach(() => {
    teardownShellHarness()
    localStorage.clear()
  })

  it('hydrates once from an injected repository on mount', async () => {
    const recipe: Recipe = {
      id: 'snap-1',
      name: 'Snapshot',
      workflowId: recipeHydrationConfig.workflow,
      updatedAt: '2026-01-01T00:00:00.000Z',
      context: { name: 'from-snapshot', region: 'us-west' },
    }
    const getSpy = vi.fn(createFakeRepository(recipe).get)

    const { wrapper, route, navigateTo } = mountWorkflowWizardShell({
      config: recipeHydrationConfig,
      registry: {},
      routePath: '/flow',
      recipeRepository: {
        ...createFakeRepository(recipe),
        get: getSpy,
      },
      initialRecipeId: 'snap-1',
      landOn: 'b',
    })

    await flushShellAfterHydration(wrapper)

    expect(getSpy).toHaveBeenCalledTimes(1)
    expect(getSpy).toHaveBeenCalledWith(recipeHydrationConfig.workflow, 'snap-1')
    expect(navigateTo).toHaveBeenCalledWith('/flow/b')
    expect(route.path).toBe('/flow/b')
    expectStepperAndCard(wrapper, true)
  })

  it('defers stepper and step-card until recipe get resolves', async () => {
    const recipe: Recipe = {
      id: 'snap-1',
      name: 'Snapshot',
      workflowId: recipeHydrationConfig.workflow,
      updatedAt: '2026-01-01T00:00:00.000Z',
      context: { name: 'from-snapshot', region: 'us-west' },
    }
    let resolveGet!: (value: Recipe | undefined) => void
    const getPromise = new Promise<Recipe | undefined>((resolve) => {
      resolveGet = resolve
    })
    const getSpy = vi.fn(async () => getPromise)

    const { wrapper, route, navigateTo } = mountWorkflowWizardShell({
      config: recipeHydrationConfig,
      registry: {},
      routePath: '/flow',
      recipeRepository: {
        ...createFakeRepository(recipe),
        get: getSpy,
      },
      initialRecipeId: 'snap-1',
      landOn: 'b',
    })

    await nextTick()
    await Promise.resolve()

    expectStepperAndCard(wrapper, false)
    expect(wrapper.find('[data-testid="wizard-hydrating"]').exists()).toBe(true)

    resolveGet(recipe)
    await flushShellAfterHydration(wrapper)

    expectStepperAndCard(wrapper, true)
    expect(wrapper.find('[data-testid="wizard-hydrating"]').exists()).toBe(false)
    expect(getSpy).toHaveBeenCalledTimes(1)
    expect(navigateTo).toHaveBeenCalledWith('/flow/b')
    expect(route.path).toBe('/flow/b')
  })

  it('surfaces not-found via toast when the repository returns nothing', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { wrapper, toastAdd } = mountWorkflowWizardShell({
      config: recipeHydrationConfig,
      registry: {},
      routePath: '/flow',
      recipeRepository: createFakeRepository(undefined),
      initialRecipeId: 'missing',
    })

    await flushShellAfterHydration(wrapper)

    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Failed to load recipe',
      color: 'error',
    }))
    expectStepperAndCard(wrapper, true)
    consoleSpy.mockRestore()
  })

  it('surfaces fetch failure via toast when get rejects', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { wrapper, toastAdd } = mountWorkflowWizardShell({
      config: recipeHydrationConfig,
      registry: {},
      routePath: '/flow',
      recipeRepository: createFakeRepository(undefined, true),
      initialRecipeId: 'snap-1',
    })

    await flushShellAfterHydration(wrapper)

    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Failed to load recipe',
      description: 'repository unavailable',
      color: 'error',
    }))
    expectStepperAndCard(wrapper, true)
    consoleSpy.mockRestore()
  })

  it('leaves behaviour unchanged when hydration props are absent', async () => {
    const { wrapper, route, navigateTo, toastAdd } = mountWorkflowWizardShell({
      config: recipeHydrationConfig,
      registry: {},
      routePath: '/flow',
    })

    await flushShell()

    expect(navigateTo).not.toHaveBeenCalled()
    expect(route.path).toBe('/flow')
    expect(toastAdd).not.toHaveBeenCalled()
    expectStepperAndCard(wrapper, true)
  })

  it('hydrates from initialSnapshot without calling repository get', async () => {
    const getSpy = vi.fn(createFakeRepository(undefined).get)

    const { wrapper, route, navigateTo } = mountWorkflowWizardShell({
      config: recipeHydrationConfig,
      registry: {},
      routePath: '/flow',
      recipeRepository: {
        ...createFakeRepository(undefined),
        get: getSpy,
      },
      initialSnapshot: { name: 'from-snapshot', region: 'us-west' },
      landOn: 'b',
    })

    await flushShellAfterHydration(wrapper)

    expect(getSpy).not.toHaveBeenCalled()
    expect(navigateTo).toHaveBeenCalledWith('/flow/b')
    expect(route.path).toBe('/flow/b')
  })

  it('prefers initialSnapshot over initialRecipeId', async () => {
    const recipe: Recipe = {
      id: 'snap-1',
      name: 'Snapshot',
      workflowId: recipeHydrationConfig.workflow,
      updatedAt: '2026-01-01T00:00:00.000Z',
      context: { name: 'from-recipe', region: 'eu-west' },
    }
    const getSpy = vi.fn(createFakeRepository(recipe).get)

    const { wrapper, route, navigateTo } = mountWorkflowWizardShell({
      config: recipeHydrationConfig,
      registry: {},
      routePath: '/flow',
      recipeRepository: {
        ...createFakeRepository(recipe),
        get: getSpy,
      },
      initialSnapshot: { name: 'from-snapshot', region: 'us-west' },
      initialRecipeId: 'snap-1',
      landOn: 'b',
    })

    await flushShellAfterHydration(wrapper)

    expect(getSpy).not.toHaveBeenCalled()
    expect(navigateTo).toHaveBeenCalledWith('/flow/b')
    expect(route.path).toBe('/flow/b')
  })

  it('surfaces snapshot hydrate failure via toast', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { wrapper, toastAdd } = mountWorkflowWizardShell({
      config: recipeHydrationConfig,
      registry: {},
      routePath: '/flow',
      initialSnapshot: { name: 'from-snapshot' },
      landOn: 'missing-step',
    })

    await flushShellAfterHydration(wrapper)

    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Failed to load workflow snapshot',
      color: 'error',
    }))
    expectStepperAndCard(wrapper, true)
    consoleSpy.mockRestore()
  })

  it('uses snapshotHydrateErrorTitle when snapshot hydrate fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { wrapper, toastAdd } = mountWorkflowWizardShell({
      config: recipeHydrationConfig,
      registry: {},
      routePath: '/flow',
      initialSnapshot: { name: 'from-snapshot' },
      landOn: 'missing-step',
      snapshotHydrateErrorTitle: 'Failed to start new version',
    })

    await flushShellAfterHydration(wrapper)

    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Failed to start new version',
      color: 'error',
    }))
    expectStepperAndCard(wrapper, true)
    consoleSpy.mockRestore()
  })
})
