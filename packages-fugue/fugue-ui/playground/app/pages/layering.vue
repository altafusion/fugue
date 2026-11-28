<script setup lang="ts">
useSeoMeta({ title: 'Layering · Fugue UI Playground' })

// Mimics a site gallery in edit mode: draggable tiles with their own buttons, a site dock (Editing Controls),
// and a site overlay at Nuxt UI's modal level (z-50). Open the dev tools drawer over all of it.
const tiles = ref(Array.from({ length: 12 }, (_, i) => ({ id: i + 1, hidden: false })))
const dragged = ref<number | null>(null)
const dropLog = ref<string[]>([])
const editing = ref(true)
const overlay = ref(false)

// fugue-theme's black canvas makes --ui-bg-muted a 5% white tint; the playground has no theme, so this switch imitates it.
const translucentMuted = ref(false)
watch(translucentMuted, (on) => {
  if (on)
    document.documentElement.style.setProperty('--ui-bg-muted', 'rgb(255 255 255 / 0.05)')
  else
    document.documentElement.style.removeProperty('--ui-bg-muted')
})
onBeforeUnmount(() => document.documentElement.style.removeProperty('--ui-bg-muted'))

function onDrop(target: number) {
  dropLog.value.unshift(`dropped ${dragged.value} onto tile ${target}`)
  dragged.value = null
}
</script>

<template>
  <UContainer class="py-10">
    <div class="flex flex-col gap-4">
      <h1 class="text-3xl font-semibold text-highlighted">
        Layering
      </h1>
      <p class="text-muted">
        Open the dev tools drawer (<code>?qetools</code>) in each position. Nothing below may show through it, no
        drag or drop on it may reach a tile, and the dev tools dock must stay clickable above the z-50 overlay.
      </p>
      <div class="flex gap-2">
        <UButton
          :label="overlay ? 'Hide z-50 overlay' : 'Show z-50 overlay'"
          data-testid="toggle-overlay"
          color="neutral"
          variant="outline"
          @click="overlay = !overlay"
        />
        <UButton
          :label="translucentMuted ? 'Opaque --ui-bg-muted' : 'Translucent --ui-bg-muted (black canvas)'"
          data-testid="toggle-translucent"
          color="neutral"
          variant="outline"
          @click="translucentMuted = !translucentMuted"
        />
      </div>
      <p
        class="text-sm text-muted"
        data-testid="drop-log"
      >
        {{ dropLog[0] ?? 'no drops yet' }}
      </p>
      <div class="grid grid-cols-3 gap-4 sm:grid-cols-4">
        <div
          v-for="tile in tiles"
          :key="tile.id"
          :data-testid="`tile-${tile.id}`"
          class="relative aspect-square cursor-grab rounded-lg bg-primary/30"
          draggable="true"
          @dragstart="dragged = tile.id"
          @dragover.prevent
          @drop.prevent="onDrop(tile.id)"
        >
          <span class="absolute left-2 top-2 z-10 text-lg font-bold">Tile {{ tile.id }}</span>
          <div class="absolute right-1 top-1 z-20 flex gap-1">
            <UButton
              icon="i-lucide-eye-off"
              size="xs"
              color="neutral"
              aria-label="Hide"
            />
            <UButton
              icon="i-lucide-trash"
              size="xs"
              color="error"
              aria-label="Delete"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="overlay"
      data-testid="site-overlay"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <UButton
        label="Close overlay"
        @click="overlay = false"
      />
    </div>

    <FloatingDock
      v-model:open="editing"
      storage-key="playground:editing-controls"
      label="Editing Controls"
      :default-percent="0"
      align="start"
      bottom-class="bottom-14"
      :ui="{ bar: 'dark:bg-[#1e1e77]', panel: 'dark:bg-[#1e1e77]' }"
    >
      <p class="text-sm">
        Editing controls
      </p>
    </FloatingDock>
  </UContainer>
</template>
