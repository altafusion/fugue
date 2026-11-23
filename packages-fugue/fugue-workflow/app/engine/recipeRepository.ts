import type { Recipe, RecipeRepository, RecipeWrite } from '../types/recipe'
import { cloneSerializableContext } from './recipeContext'

const STORAGE_PREFIX = 'workflow-recipes:'

function storageKeyFor(workflowId: string): string {
  return `${STORAGE_PREFIX}${workflowId}`
}

interface StoredRecipes {
  recipes: Recipe[]
}

function parseStoredRecipes(raw: string): Recipe[] {
  const stored = JSON.parse(raw) as StoredRecipes
  return Array.isArray(stored.recipes)
    ? stored.recipes
    : []
}

function readStoredRecipes(workflowId: string): Recipe[] {
  if (typeof window === 'undefined')
    return []

  const key = storageKeyFor(workflowId)
  try {
    const raw = localStorage.getItem(key)
    if (!raw)
      return []
    return parseStoredRecipes(raw)
  } catch {
    return []
  }
}

function writeStoredRecipes(workflowId: string, recipes: Recipe[]): boolean {
  if (typeof window === 'undefined')
    return false

  try {
    localStorage.setItem(storageKeyFor(workflowId), JSON.stringify({ recipes }))
    return true
  } catch {
    // best-effort persistence; ignore (private mode / quota)
    return false
  }
}

function newRecipeId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function')
    return globalThis.crypto.randomUUID()
  return `recipe-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export class LocalStorageRecipeRepository implements RecipeRepository {
  async list(workflowId: string): Promise<Recipe[]> {
    return readStoredRecipes(workflowId)
  }

  async get(workflowId: string, id: string): Promise<Recipe | undefined> {
    const recipes = await this.list(workflowId)
    return recipes.find(recipe => recipe.id === id)
  }

  async save(workflowId: string, input: RecipeWrite): Promise<Recipe> {
    const recipes = readStoredRecipes(workflowId)
    const existing = recipes.find(recipe => recipe.name === input.name)
    const updatedAt = new Date().toISOString()
    const recipe: Recipe = existing
      ? {
          ...existing,
          name: input.name,
          description: input.description,
          context: cloneSerializableContext(input.context),
          updatedAt,
        }
      : {
          id: newRecipeId(),
          name: input.name,
          description: input.description,
          workflowId,
          context: cloneSerializableContext(input.context),
          updatedAt,
        }

    const next = existing
      ? recipes.map(item => (item.id === existing.id
          ? recipe
          : item))
      : [...recipes, recipe]

    if (!writeStoredRecipes(workflowId, next))
      throw new Error('Could not save recipe — browser storage is unavailable or full.')
    return recipe
  }

  async remove(workflowId: string, id: string): Promise<void> {
    const recipes = readStoredRecipes(workflowId)
    const next = recipes.filter(recipe => recipe.id !== id)
    if (!writeStoredRecipes(workflowId, next))
      throw new Error('Could not remove recipe — browser storage is unavailable or full.')
  }
}

export const localStorageRecipeRepository = new LocalStorageRecipeRepository()
