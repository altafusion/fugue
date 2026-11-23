<script setup lang="ts">
import type { Recipe } from '#orchestrator'

const props = withDefaults(defineProps<{
  recipes: Recipe[]
  loading?: boolean
}>(), {
  loading: false,
})

const emit = defineEmits<{
  load: [recipe: Recipe]
  remove: [recipe: Recipe]
}>()

const open = defineModel<boolean>('open', { required: true })

const searchQuery = ref('')

watch(open, (isOpen) => {
  if (isOpen)
    searchQuery.value = ''
})

const filteredRecipes = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q)
    return props.recipes
  return props.recipes.filter((recipe) => {
    const name = recipe.name.toLowerCase()
    const description = (recipe.description ?? '').toLowerCase()
    return name.includes(q) || description.includes(q)
  })
})

function formatUpdatedAt(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime()))
    return value
  return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Recipes"
    description="Manage or use saved wizard recipes"
  >
    <template #body>
      <div class="space-y-3">
        <UInput
          v-if="recipes.length > 0"
          v-model="searchQuery"
          icon="i-lucide-search"
          placeholder="Search recipes…"
          size="sm"
          color="neutral"
          variant="soft"
          aria-label="Search recipes"
          autocomplete="off"
          class="w-full"
          :disabled="loading"
          :ui="{ root: 'w-full' }"
        />

        <UCard
          v-if="loading && recipes.length === 0"
          variant="subtle"
          :ui="{
            body: 'p-0 sm:p-0 divide-y divide-default',
          }"
        >
          <div
            v-for="n in 3"
            :key="n"
            class="px-3 py-2.5"
          >
            <USkeleton :ui="{ base: 'h-4 w-2/5' }" />
            <USkeleton
              class="mt-1.5"
              :ui="{ base: 'h-3 w-3/5' }"
            />
          </div>
        </UCard>

        <UAlert
          v-else-if="recipes.length === 0"
          color="neutral"
          variant="subtle"
          title="No Recipes Yet"
          description="Save your current wizard answers to reuse them in a new run."
        />

        <UAlert
          v-else-if="filteredRecipes.length === 0"
          color="neutral"
          variant="subtle"
          title="No Matches"
          description="Try a different search term."
        />

        <UCard
          v-else
          variant="subtle"
          :ui="{
            body: 'p-0 sm:p-0 divide-y divide-default',
          }"
        >
          <div
            v-for="recipe in filteredRecipes"
            :key="recipe.id"
            class="space-y-1 px-3 py-2.5"
          >
            <div class="flex items-start gap-3">
              <p class="min-w-0 flex-1 truncate text-sm font-medium text-highlighted">
                {{ recipe.name }}
              </p>
              <div class="flex shrink-0 items-center gap-1.5">
                <UButton
                  icon="i-lucide-trash-2"
                  color="neutral"
                  variant="outline"
                  size="xs"
                  square
                  :disabled="loading"
                  :aria-label="`Remove recipe ${recipe.name}`"
                  @click="emit('remove', recipe)"
                />
                <UButton
                  icon="i-lucide-pointer"
                  color="primary"
                  variant="solid"
                  size="xs"
                  square
                  :disabled="loading"
                  :aria-label="`Use recipe ${recipe.name}`"
                  @click="emit('load', recipe)"
                />
              </div>
            </div>
            <p class="text-xs text-muted">
              {{ formatUpdatedAt(recipe.updatedAt) }}
            </p>
            <p
              v-if="recipe.description"
              class="line-clamp-2 text-xs text-muted"
            >
              {{ recipe.description }}
            </p>
          </div>
        </UCard>
      </div>
    </template>
  </UModal>
</template>
