import type { MaybeRefOrGetter, Ref } from 'vue'
import type { Recipe, RecipeRepository, RecipeWrite } from '../types/recipe'
import { ref, toValue } from 'vue'
import { localStorageRecipeRepository } from './recipeRepository'

export interface UseWorkflowRecipesReturn {
  recipes: Ref<Recipe[]>
  loading: Ref<boolean>
  refresh: () => Promise<void>
  save: (input: RecipeWrite) => Promise<Recipe>
  remove: (id: string) => Promise<void>
  get: (id: string) => Promise<Recipe | undefined>
}

/**
 * Workflow-scoped recipe list backed by a pluggable repository (localStorage MVP).
 */
export function useWorkflowRecipes(
  workflowId: MaybeRefOrGetter<string>,
  repository: RecipeRepository = localStorageRecipeRepository,
): UseWorkflowRecipesReturn {
  const recipes = ref<Recipe[]>([])
  const loading = ref(false)
  let refreshSeq = 0

  async function refresh(): Promise<void> {
    const seq = ++refreshSeq
    loading.value = true
    try {
      const next = await repository.list(toValue(workflowId))
      if (seq === refreshSeq)
        recipes.value = next
    } finally {
      if (seq === refreshSeq)
        loading.value = false
    }
  }

  async function save(input: RecipeWrite): Promise<Recipe> {
    const seq = ++refreshSeq
    loading.value = true
    try {
      const saved = await repository.save(toValue(workflowId), input)
      const next = await repository.list(toValue(workflowId))
      if (seq === refreshSeq)
        recipes.value = next
      return saved
    } finally {
      if (seq === refreshSeq)
        loading.value = false
    }
  }

  async function remove(id: string): Promise<void> {
    const seq = ++refreshSeq
    loading.value = true
    try {
      await repository.remove(toValue(workflowId), id)
      const next = await repository.list(toValue(workflowId))
      if (seq === refreshSeq)
        recipes.value = next
    } finally {
      if (seq === refreshSeq)
        loading.value = false
    }
  }

  async function get(id: string): Promise<Recipe | undefined> {
    return repository.get(toValue(workflowId), id)
  }

  return {
    recipes,
    loading,
    refresh,
    save,
    remove,
    get,
  }
}
