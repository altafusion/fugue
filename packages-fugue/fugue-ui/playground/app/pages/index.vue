<script setup lang="ts">
interface ComponentEntry {
  name: string
  description: string
  /** The playground page that shows it; leave out until one exists. */
  to?: string
}

const groups: { title: string, components: ComponentEntry[] }[] = [
  {
    title: '@altafusion/fugue-ui',
    components: [
      { name: 'AccentSectionCard', description: 'A UCard with a coloured left stripe, an optional hint tooltip and a close button.' },
      { name: 'CopyToClipboard', description: 'A copyable label that confirms the copy with a badge.' },
      { name: 'FileDropzone', description: 'A drag-and-drop file picker with extension and size limits.' },
      { name: 'FloatingDock', description: 'A bar fixed to the bottom of the page that is dragged by its grip and opens a panel.', to: '/floating-dock' },
      { name: 'FugueAppHeader', description: 'The app header, in a default and a landing visual style.' },
      { name: 'PresenceOrb', description: 'An animated status dot to pair with visible text.' },
      { name: 'TileGroupSection', description: 'A titled section for a group of tiles, with Required and Optional badges.' },
      { name: 'TileHintTooltip', description: 'A lightbulb hint on a tile title that opens on hover or focus.' },
      { name: 'TileSelector', description: 'A single-select tile picker built on the radio group.' },
      { name: 'TileSelectorMultiple', description: 'A multi-select tile picker built on the checkbox group.' },
    ],
  },
  {
    title: '@altafusion/fugue-devtools',
    components: [
      { name: 'DevToolsPanel', description: 'A draggable dock and a drawer of debugging sections. Mount it once; ?qetools turns it on.', to: '/devtools' },
    ],
  },
]

useSeoMeta({ title: 'Fugue UI Playground' })
</script>

<template>
  <UContainer class="py-10">
    <h1 class="text-3xl font-semibold text-highlighted">
      Fugue UI Playground
    </h1>
    <p class="mt-4 max-w-2xl text-muted">
      Our custom components, and the pages that show them. A component without a page does not have an example yet. To add one,
      create a page under <code>app/pages</code>, link it in <code>app/app.vue</code>, and set its <code>to</code> in this list.
    </p>

    <section
      v-for="group in groups"
      :key="group.title"
      class="mt-10"
    >
      <h2 class="text-lg font-semibold text-highlighted">
        {{ group.title }}
      </h2>
      <ul class="mt-3 divide-y divide-default rounded-lg border border-default">
        <li
          v-for="component in group.components"
          :key="component.name"
          class="flex items-center justify-between gap-4 px-4 py-3"
        >
          <div class="min-w-0">
            <code class="font-semibold text-highlighted">{{ component.name }}</code>
            <p class="text-sm text-muted">
              {{ component.description }}
            </p>
          </div>
          <UButton
            v-if="component.to"
            :to="component.to"
            label="Example"
            trailing-icon="i-lucide-arrow-right"
            color="neutral"
            variant="outline"
            size="xs"
          />
          <span
            v-else
            class="shrink-0 text-xs text-dimmed"
          >No example yet</span>
        </li>
      </ul>
    </section>
  </UContainer>
</template>
