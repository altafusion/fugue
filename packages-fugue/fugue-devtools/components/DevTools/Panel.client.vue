<script setup lang="ts">
import type { DevToolsPanelPosition, DevToolsPanelUi } from '#devtools/composables/devtoolsTypes'
import { isHorizontalDevToolsDock } from '#devtools/persist'
import { DEVTOOLS_LAYER_CLASSES, devToolsLayerValue } from '#devtools/utils/devtoolsLayers'

/**
 * The whole dev tools UI. The `.client.vue` suffix keeps it off the server: the API it reads is provided by a client-only plugin. Mount `<DevToolsPanel />` once (app.vue) and it works alone: it reads `useDevTools()`, shows a
 * draggable dock while the tools are enabled, and opens a non-modal drawer with the registered sections.
 *
 * Sections come from `registerSection()` (the way a layer or plugin adds one). Slots are the second path:
 *  - `dock`: replace the toggle (receives `open` and `toggle`)
 *  - `header`: extra controls in the drawer header
 *  - `section-<id>`: override how one registered section renders
 *  - default: extra inline content below the active section (use `DevToolsSection`)
 *  - `footer`
 */
const {
  bodyGridClass = '',
  sectionClass = '',
  brand = 'Dev Tools',
  ui,
} = defineProps<{
  /** Extra grid classes on the section container (e.g. 3-column bottom dock). */
  bodyGridClass?: string
  /** Extra class on sections passed through `sectionClass` slot prop. */
  sectionClass?: string
  brand?: string
  /** Classes for the `panel` (the drawer) and the `bar` (the dock's toggle bar), the same slots as `FloatingDock`'s `ui`, merged over the defaults (Nuxt UI's `ui` convention). */
  ui?: DevToolsPanelUi
}>()

const api = useDevTools()
const { chrome, showPanel, visibleSections, activeSection } = api

const open = computed({
  get: () => chrome.value.open,
  set: value => api.updateChrome('open', value),
})

const panelPosition = computed<DevToolsPanelPosition>({
  get: () => chrome.value.panelPosition,
  set: value => api.updateChrome('panelPosition', value),
})

const isHorizontalDock = computed(() => isHorizontalDevToolsDock(panelPosition.value))

// The tab strip names the active section, so the section only repeats its title when there are no tabs (a single section).
const tabItems = computed(() => visibleSections.value.map(section => ({ label: section.label, value: section.id })))
const activeTab = computed({
  get: () => activeSection.value?.id,
  set: (id) => {
    if (id !== undefined)
      api.activeId.value = String(id)
  },
})

function toggle() {
  open.value = !open.value
}

// The defaults are solid colours, not `bg-muted`: a theme may make that translucent (fugue-theme's black canvas does), which left the drawer see-through. The z-index comes from `devtools-panel.css`.
const DEFAULT_PANEL_CLASS = 'dark:bg-[#1e1e77]'
const DEFAULT_BAR_CLASS = 'dark:bg-[#1e1e77]'

const drawerSurfaceClass = computed(() =>
  `devtools-panel__surface--drawer ${DEVTOOLS_LAYER_CLASSES.drawer} ring-default shadow-lg drop-shadow-xl ${DEFAULT_PANEL_CLASS} ${ui?.panel ?? ''}`)

// A drag that ends over the drawer is not a drop on the page behind it. Stopping the events here also keeps page-level (document) drag handlers from seeing them.
function refuseDrop(event: DragEvent) {
  event.stopPropagation()
  if (event.dataTransfer)
    event.dataTransfer.dropEffect = 'none'
}

// `content` is typed as the dialog content's props, which leave out DOM listeners; they still reach the element as attributes.
const drawerContentListeners = { onDragenter: refuseDrop, onDragover: refuseDrop, onDrop: refuseDrop } as unknown as Record<string, never>

// `bottom-12` leaves room for the dock bar under a bottom-docked drawer, so the two never overlap. The drawer is inset 1rem from the sides, and the dock's margin (16) lines the bar's right end up with it.
const drawerUi = computed(() => {
  const surface = drawerSurfaceClass.value
  const body = 'devtools-panel overflow-y-auto px-3 py-2'
  const container = 'gap-0'

  switch (panelPosition.value) {
    case 'left':
      return { content: `top-22 left-4 bottom-4 max-w-96 ${surface}`, body, container }
    case 'top':
      return { content: `inset-x-4 top-22 max-h-[min(24rem,70vh)] sm:max-h-[min(28rem,75vh)] ${surface}`, body, container }
    case 'bottom':
      return { content: `inset-x-4 bottom-12 max-h-[min(24rem,70vh)] sm:max-h-[min(28rem,75vh)] ${surface}`, body, container }
    default:
      return { content: `top-22 right-4 bottom-4 max-w-96 ${surface}`, body, container }
  }
})
</script>

<template>
  <template v-if="showPanel">
    <slot
      name="dock"
      :open="open"
      :toggle="toggle"
    >
      <FloatingDock
        v-model:open="open"
        storage-key="fugue-devtools:dock"
        label="Dev tools"
        bottom-class="bottom-2"
        :ui="{ bar: [DEFAULT_BAR_CLASS, ui?.bar] }"
        :z-index="devToolsLayerValue('dock')"
        :default-percent="100"
        align="end"
        :margin="16"
      />
    </slot>

    <UDrawer
      :key="panelPosition"
      v-model:open="open"
      :direction="panelPosition"
      :modal="false"
      :overlay="false"
      :dismissible="false"
      :handle="false"
      handle-only
      :content="drawerContentListeners"
      inset
      :ui="drawerUi"
    >
      <template #body>
        <DevToolsNav
          :brand="brand"
          :panel-position="panelPosition"
          :show-settings-toggle="false"
          @position-change="panelPosition = $event"
          @close="open = false"
          @turn-off="api.disable()"
        >
          <template #brand>
            <slot name="header">
              {{ brand }}
            </slot>
          </template>
        </DevToolsNav>

        <UTabs
          v-if="visibleSections.length > 1"
          v-model="activeTab"
          :items="tabItems"
          :content="false"
          variant="pill"
          size="xs"
          class="mt-2"
        />

        <div
          class="mt-3 grid grid-cols-1 gap-4"
          :class="bodyGridClass"
        >
          <template v-if="activeSection">
            <slot
              :name="`section-${activeSection.id}`"
              :section-class="sectionClass"
              :panel-position="panelPosition"
              :is-horizontal-dock="isHorizontalDock"
            >
              <DevToolsSection
                :title="visibleSections.length > 1 ? undefined : activeSection.label"
                :class="sectionClass"
              >
                <component :is="activeSection.component" />
              </DevToolsSection>
            </slot>
          </template>
          <p
            v-else
            class="text-sm text-muted"
          >
            Nothing to show here for you.
          </p>

          <slot
            :section-class="sectionClass"
            :is-bottom-dock="panelPosition === 'bottom'"
            :is-horizontal-dock="isHorizontalDock"
            :panel-position="panelPosition"
          />
        </div>

        <slot name="footer" />
      </template>
    </UDrawer>
  </template>
</template>
