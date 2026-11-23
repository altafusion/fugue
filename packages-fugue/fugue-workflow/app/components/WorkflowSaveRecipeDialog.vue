<script setup lang="ts">
const props = withDefaults(defineProps<{
  saving?: boolean
}>(), {
  saving: false,
})

const emit = defineEmits<{
  save: [payload: { name: string, description?: string }]
}>()

const open = defineModel<boolean>('open', { required: true })

const name = ref('')
const description = ref('')

watch(open, (isOpen) => {
  if (isOpen) {
    name.value = ''
    description.value = ''
  }
})

const canSave = computed(() => name.value.trim().length > 0)

function close(): void {
  open.value = false
}

function submit(): void {
  if (!canSave.value || props.saving)
    return
  emit('save', {
    name: name.value.trim(),
    description: description.value.trim() || undefined,
  })
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Save Recipe"
    description="Store the current wizard answers as a reusable recipe."
    :dismissible="!saving"
    :close="!saving"
  >
    <template #body>
      <form
        id="recipe-form"
        class="w-full space-y-4"
        @submit.prevent="submit"
      >
        <UFormField
          label="Name"
          name="recipeName"
          required
          class="w-full"
        >
          <UInput
            v-model="name"
            class="w-full"
            autocomplete="off"
            :disabled="saving"
          />
        </UFormField>

        <UFormField
          label="Description"
          name="recipeDescription"
          class="w-full"
        >
          <UTextarea
            v-model="description"
            class="w-full"
            :disabled="saving"
            :rows="3"
          />
        </UFormField>
      </form>
    </template>

    <template #footer>
      <div class="flex flex-wrap justify-end gap-3">
        <UButton
          label="Cancel"
          color="neutral"
          variant="subtle"
          :disabled="saving"
          @click="close"
        />
        <UButton
          label="Save"
          color="primary"
          type="submit"
          form="recipe-form"
          :disabled="!canSave || saving"
          :loading="saving"
        />
      </div>
    </template>
  </UModal>
</template>
