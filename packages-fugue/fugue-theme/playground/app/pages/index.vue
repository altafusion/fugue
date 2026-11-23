<script setup lang="ts">
const name = ref('')
const note = ref('')
const role = ref('Editor')
const notify = ref(true)

const roles = [
  { label: 'Editor', value: 'Editor' },
  { label: 'Admin', value: 'Admin' },
  { label: 'Viewer', value: 'Viewer' },
]

useSeoMeta({ title: 'Fugue Theme Playground' })
</script>

<template>
  <UContainer class="py-10">
    <div class="flex flex-col gap-12">
      <header class="max-w-2xl">
        <h1 class="text-3xl font-semibold text-highlighted">
          Theme Playground
        </h1>
        <p class="mt-3 text-lg text-muted">
          Canvas, text roles, and the controls a page actually uses. Switch color mode in the header.
        </p>
      </header>

      <section>
        <h2 class="mb-4 text-lg font-semibold text-highlighted">
          Surfaces
        </h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-lg border border-default bg-default p-4">
            <p class="font-medium text-highlighted">
              Canvas
            </p>
            <p class="mt-1 text-sm text-muted">
              The page surface.
            </p>
            <p class="mt-3 text-xs text-dimmed">
              <code>bg-default</code>
            </p>
          </div>
          <div class="rounded-lg border border-default bg-muted p-4">
            <p class="font-medium text-highlighted">
              Muted
            </p>
            <p class="mt-1 text-sm text-muted">
              A quiet inset.
            </p>
            <p class="mt-3 text-xs text-dimmed">
              <code>bg-muted</code>
            </p>
          </div>
          <div class="rounded-lg border border-default bg-elevated p-4">
            <p class="font-medium text-highlighted">
              Elevated
            </p>
            <p class="mt-1 text-sm text-muted">
              Cards and menus.
            </p>
            <p class="mt-3 text-xs text-dimmed">
              <code>bg-elevated</code>
            </p>
          </div>
          <div class="rounded-lg border border-default bg-accented p-4">
            <p class="font-medium text-highlighted">
              Accented
            </p>
            <p class="mt-1 text-sm text-muted">
              A stronger fill.
            </p>
            <p class="mt-3 text-xs text-dimmed">
              <code>bg-accented</code>
            </p>
          </div>
        </div>
      </section>

      <section class="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 class="mb-4 text-lg font-semibold text-highlighted">
            Text
          </h2>
          <div class="flex flex-col gap-3 rounded-lg border border-default p-5">
            <p class="text-2xl font-semibold text-highlighted">
              Heading
            </p>
            <p class="text-default">
              Body copy sits on the default text role. This is the paragraph you read at length.
            </p>
            <p class="text-muted">
              Muted copy is for ledes and secondary lines.
            </p>
            <p class="text-toned">
              Toned copy sits between body and muted.
            </p>
            <p class="text-dimmed">
              Dimmed copy is the quietest role.
            </p>
            <p class="text-primary">
              Primary color on a sentence.
            </p>
          </div>
        </div>

        <div>
          <h2 class="mb-4 text-lg font-semibold text-highlighted">
            Actions
          </h2>
          <div class="flex flex-col gap-4 rounded-lg border border-default p-5">
            <div class="flex flex-wrap items-center gap-3">
              <UButton label="Primary" />
              <UButton label="Soft" variant="soft" />
              <UButton label="Outline" variant="outline" />
              <UButton label="Ghost" color="neutral" variant="ghost" />
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <UButton label="Neutral" color="neutral" variant="outline" />
              <UButton label="Link" variant="link" />
              <NuxtLink to="/" class="text-primary">
                Text Link
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <section class="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 class="mb-4 text-lg font-semibold text-highlighted">
            Fields
          </h2>
          <form class="flex flex-col gap-4 rounded-lg border border-default p-5" @submit.prevent>
            <UFormField label="Name">
              <UInput v-model="name" placeholder="Ada Lovelace" class="w-full" />
            </UFormField>
            <UFormField label="Role">
              <USelect v-model="role" :items="roles" class="w-full" />
            </UFormField>
            <UFormField label="Note">
              <UTextarea v-model="note" placeholder="A short note" :rows="3" class="w-full" />
            </UFormField>
            <USwitch v-model="notify" label="Send updates" />
          </form>
        </div>

        <div>
          <h2 class="mb-4 text-lg font-semibold text-highlighted">
            Status
          </h2>
          <div class="flex flex-col gap-4">
            <div class="flex flex-wrap gap-2">
              <UBadge label="Primary" />
              <UBadge label="Neutral" color="neutral" variant="subtle" />
              <UBadge label="Success" color="success" variant="subtle" />
              <UBadge label="Warning" color="warning" variant="subtle" />
              <UBadge label="Error" color="error" variant="subtle" />
            </div>
            <UAlert
              color="info"
              variant="subtle"
              title="Info"
              description="A quiet notice on the canvas."
            />
            <UAlert
              color="success"
              variant="subtle"
              title="Success"
              description="Something finished cleanly."
            />
            <UAlert
              color="warning"
              variant="subtle"
              title="Warning"
              description="Check this before continuing."
            />
            <UAlert
              color="error"
              variant="subtle"
              title="Error"
              description="This step did not complete."
            />
          </div>
        </div>
      </section>
    </div>
  </UContainer>
</template>
