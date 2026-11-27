<script setup lang="ts">
defineOptions({ name: 'FloatingDock' })

/**
 * A small bar fixed to the bottom of the page that the user drags left and right by its grip (or moves with the arrow keys
 * from the grip). It remembers where it was left. The label button opens and closes the panel, a separate rounded box just
 * above the bar; the default slot is the panel's content. Leave the slot out and the box does not render: the button then only
 * toggles `open`, for a dock that switches something else (a drawer, say). The bar keeps its size and place when the panel opens (the dock
 * has one fixed width and the bar sits centred in it). Needs only Nuxt UI and VueUse. `storageKey` and `label` are
 * required so each dock keeps its own remembered position and names its own button.
 */
const {
  storageKey,
  label,
  defaultPercent = 50,
  bottomClass = 'bottom-20',
} = defineProps<{
  /** localStorage key the bar's position is remembered under. */
  storageKey: string
  /** Text on the open and close button. */
  label: string
  /** Where the bar starts, as a percentage (0 is flush left, 100 flush right). */
  defaultPercent?: number
  /** Tailwind class for the distance from the bottom edge. It must be visible to the app's Tailwind (a literal class in its source). */
  bottomClass?: string
}>()

const open = defineModel<boolean>('open', { default: false })

const dock = useTemplateRef<HTMLElement>('dock')
const area = useTemplateRef<HTMLElement>('area')
const grip = useTemplateRef<HTMLElement>('grip')
const { dragging, dockStyle, onKeydown } = useDraggableDock(dock, grip, area, { storageKey, defaultPercent })
</script>

<template>
  <!-- In the body, so no transformed ancestor (a layout shell, a page transition) can become the "fixed" reference. -->
  <Teleport to="body">
    <!--
      The dock sits in a fixed wrapper that covers the page, and is itself only absolute. Nuxt Studio rewrites the inline `left`
      of every `position: fixed` element on the page (to the sidebar's width, or to nothing) whenever it activates or its
      sidebar opens or closes, which wiped the dock's own `left` and threw it off the page on load. The wrapper takes that
      rewrite instead (its `left` then also keeps the dock beside Studio's sidebar), and the dock's percentage is measured in it.
    -->
    <div
      ref="area"
      class="pointer-events-none fixed inset-0 z-40"
    >
      <div
        ref="dock"
        class="pointer-events-none absolute flex w-56 flex-col gap-0.5"
        :class="[bottomClass, { 'select-none': dragging }]"
        :style="dockStyle"
      >
        <div
          v-if="open && $slots.default"
          class="pointer-events-auto rounded-xl border border-primary/40 bg-default px-4 py-3 shadow-lg"
          role="group"
          :aria-label="label"
        >
          <slot />
        </div>
        <div class="pointer-events-auto flex w-fit items-center self-center rounded-full border border-primary/40 bg-default p-0.5 shadow-lg">
          <!-- The drag handle is a plain element: pointer events bubble up to it from the button, and no component has to forward them. -->
          <div
            ref="grip"
            class="touch-none rounded-full"
            :class="dragging ? 'cursor-grabbing' : 'cursor-grab'"
          >
            <UButton
              icon="i-lucide-grip-vertical"
              :aria-label="`Move ${label}`"
              title="Drag, or use the arrow keys"
              color="neutral"
              variant="ghost"
              size="xs"
              class="rounded-full **:cursor-[inherit] cursor-[inherit]"
              @keydown="onKeydown"
            />
          </div>
          <UButton
            :label
            :aria-label="open ? `Close ${label}` : `Open ${label}`"
            :aria-expanded="open"
            color="neutral"
            variant="ghost"
            size="xs"
            class="rounded-full"
            @click="open = !open"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>
