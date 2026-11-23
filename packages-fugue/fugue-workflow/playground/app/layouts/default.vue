<script setup lang="ts">
defineOptions({
  name: 'PlaygroundDefaultLayout',
})
</script>

<template>
  <UMain>
    <header class="border-b border-default">
      <UContainer class="flex items-center justify-between gap-4 py-3">
        <NuxtLink
          to="/"
          class="flex items-center gap-2 font-medium"
        >
          <UIcon
            name="i-lucide-workflow"
            class="size-5 text-primary"
          />
          <span>Fugue Workflow Playground</span>
        </NuxtLink>
        <UButton
          to="/onboarding"
          label="User Onboarding"
          color="neutral"
          variant="ghost"
          size="sm"
        />
      </UContainer>
    </header>

    <UContainer>
      <UPage>
        <template
          v-if="$slots.aside"
          #left
        >
          <UPageAside>
            <slot name="aside" />
          </UPageAside>
        </template>

        <!-- UPage exposes #left / #default / #right only — header goes in the default slot -->
        <slot
          v-if="$slots.header"
          name="header"
        />
        <UPageBody>
          <slot />
        </UPageBody>
      </UPage>
    </UContainer>
  </UMain>
</template>
