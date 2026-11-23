import type { WorkflowContext } from './workflow'

export interface Recipe {
  id: string
  name: string
  description?: string
  workflowId: string
  context: WorkflowContext
  updatedAt: string
}

export interface RecipeWrite {
  name: string
  description?: string
  context: WorkflowContext
}

export interface RecipeRepository {
  list: (workflowId: string) => Promise<Recipe[]>
  get: (workflowId: string, id: string) => Promise<Recipe | undefined>
  save: (workflowId: string, input: RecipeWrite) => Promise<Recipe>
  remove: (workflowId: string, id: string) => Promise<void>
}
