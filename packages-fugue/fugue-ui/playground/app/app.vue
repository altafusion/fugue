<script setup lang="ts">
const links = [
  { label: 'Floating Dock', to: '/floating-dock' },
]
</script>

<template>
  <UApp>
    <header class="flex items-center justify-between border-b border-default px-6 py-3">
      <NuxtLink
        to="/"
        class="text-sm font-semibold text-highlighted"
      >
        Fugue UI
      </NuxtLink>
      <nav class="flex items-center gap-2">
        <UButton
          v-for="link in links"
          :key="link.to"
          :label="link.label"
          :to="link.to"
          color="neutral"
          variant="ghost"
          size="sm"
        />
        <PlaygroundColorSelect />
        <UColorModeButton />
      </nav>
    </header>
    <NuxtPage />
  </UApp>
</template>
