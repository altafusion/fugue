<script setup lang="ts">
const open = ref(true)
const notify = ref(true)

useSeoMeta({ title: 'Floating Dock · Fugue UI Playground' })
</script>

<template>
  <UContainer class="py-10">
    <div class="flex max-w-2xl flex-col gap-4">
      <h1 class="text-3xl font-semibold text-highlighted">
        Floating Dock
      </h1>
      <p class="text-muted">
        Drag the dock by its grip, or focus the grip and use the arrow keys, Home and End. It remembers its position across
        reloads under its <code>storage-key</code>. Reset it by clearing <code>playground:dock</code> in local storage.
        You can mount several docks on one page: give each its own <code>storage-key</code> and <code>label</code>.
      </p>
      <p class="text-muted">
        Check: the bar stays put when its panel opens, the label button only toggles the panel, the dock stays on the page
        when Nuxt Studio opens or closes its sidebar, and it looks right in light and dark.
      </p>
    </div>

    <FloatingDock
      v-model:open="open"
      storage-key="playground:dock"
      label="Dock Demo"
    >
      <p class="text-sm mb-2">
        Demo Panel Content
      </p>

      <USwitch
        v-model="notify"
        label="Notify me"
        size="sm"
      />
    </FloatingDock>
  </UContainer>
</template>
