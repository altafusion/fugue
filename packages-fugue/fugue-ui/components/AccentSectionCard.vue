<script setup lang="ts">
import type { CardProps, IconProps } from '@nuxt/ui'
import type {
  AccentSectionCardCloseConfig,
  AccentSectionCardColor,
  AccentSectionCardUi,
  AccentSectionCardVisualStyle,
} from './accentSectionCard.shared'
import { nextTick } from 'vue'
import {
  buildAccentSectionCardUCardUi,
  mergeAccentSectionCardUi,
  resolveAccentSectionCardAccent,
  resolveAccentSectionCardClose,
} from './accentSectionCard.shared'
import TileHintTooltip from './TileHintTooltip.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  title: string
  description?: string
  /** @defaultValue 'outline' */
  variant?: CardProps['variant']
  /** Root element for {@link UCard}. */
  as?: CardProps['as']
  /** Leading icon (`UIcon` name). */
  icon?: IconProps['name']
  /** Hint copy — shows {@link TileHintTooltip} beside the title. */
  tooltip?: string
  /** Heading element for the title (defaults to `h2`). */
  titleAs?: AccentSectionCardHeading
  /**
   * Left accent stripe semantic role (Nuxt UI color scale).
   * Not {@link UCard} `variant`.
   */
  color?: AccentSectionCardColor
  /** Named composer palette key (hex stripe; see {@link ACCENT_SECTION_CARD_VISUAL_STYLE_COLORS}). */
  palette?: AccentSectionCardVisualStyle
  /** Any CSS color for the left stripe (overrides `palette` and `color`). */
  accentColor?: string
  disabled?: boolean
  /**
   * Header close control (Modal pattern). Hidden when falsy.
   * @defaultValue false
   */
  close?: boolean | Omit<AccentSectionCardCloseConfig, LinkPropsKeys>
  /** Close button icon. @defaultValue `i-lucide-x` */
  closeIcon?: IconProps['name']
  ui?: AccentSectionCardUi
}>(), {
  variant: 'outline',
  titleAs: 'h2',
  color: 'primary',
  disabled: false,
  closeIcon: 'i-lucide-x',
})

const emit = defineEmits<{
  close: []
}>()

export type {
  AccentSectionCardCloseConfig,
  AccentSectionCardColor,
  AccentSectionCardUi,
  AccentSectionCardVisualStyle,
}

type LinkPropsKeys = 'to' | 'href' | 'target' | 'rel' | 'noRel' | 'external' | 'prefetch' | 'prefetchOn' | 'prefetchedClass' | 'noPrefetch' | 'trailingSlash' | 'replace' | 'ariaCurrentValue' | 'active' | 'activeClass' | 'exact' | 'exactQuery' | 'exactHash' | 'inactiveClass' | 'locale' | 'download' | 'ping' | 'referrerpolicy' | 'hreflang' | 'media'

type AccentSectionCardHeading = 'h2' | 'h3'

const attrs = useAttrs()

const shellRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<{ $el?: HTMLElement, focus?: () => void } | HTMLElement | null>(null)

function focusRefTarget(target: typeof closeButtonRef.value) {
  if (!target)
    return
  if (target instanceof HTMLElement) {
    target.focus()
    return
  }
  if (typeof target.focus === 'function') {
    target.focus()
    return
  }
  if ('$el' in target && target.$el instanceof HTMLElement)
    target.$el.focus()
}

const mergedUi = computed(() => mergeAccentSectionCardUi(props.ui))

const resolvedAccent = computed(() =>
  resolveAccentSectionCardAccent({
    accentColor: props.accentColor,
    palette: props.palette,
    color: props.color,
    disabled: props.disabled,
  }),
)

const cardUi = computed(() =>
  buildAccentSectionCardUCardUi(mergedUi.value, resolvedAccent.value.borderClass, props.disabled),
)

const cardStyle = computed(() =>
  resolvedAccent.value.mode === 'custom'
    ? resolvedAccent.value.style
    : undefined,
)

const resolvedClose = computed(() => resolveAccentSectionCardClose(props.close))

watch(() => props.disabled, (disabled, wasDisabled) => {
  if (disabled && !wasDisabled) {
    const root = shellRef.value
    const active = document.activeElement
    if (root && active instanceof HTMLElement && root.contains(active)) {
      nextTick(() => {
        if (resolvedClose.value.show)
          focusRefTarget(closeButtonRef.value)
        else
          root.focus()
      })
    }
  }
})

const inertValue = computed(() => (props.disabled ? true : undefined))

function handleClose() {
  emit('close')
}
</script>

<template>
  <div
    ref="shellRef"
    v-bind="attrs"
    tabindex="-1"
    :class="[mergedUi.root, disabled && 'select-none']"
    :aria-disabled="disabled || undefined"
  >
    <UCard
      :as="as"
      :variant="variant"
      :description="resolvedClose.show || icon || tooltip || $slots.header ? undefined : description"
      :ui="cardUi"
      :style="cardStyle"
    >
      <template
        v-if="!(resolvedClose.show || icon || tooltip || $slots.header)"
        #title
      >
        <component
          :is="titleAs"
          :class="mergedUi.title"
        >
          {{ title }}
        </component>
      </template>

      <template
        v-if="resolvedClose.show || icon || tooltip || $slots.header"
        #header
      >
        <div :class="mergedUi.headerSlot">
          <div class="flex w-full min-w-0 items-center justify-between gap-3">
            <div :class="mergedUi.titleRow">
              <span
                v-if="icon"
                :class="mergedUi.icon"
              >
                <UIcon
                  :name="icon"
                  class="size-full"
                  aria-hidden="true"
                />
              </span>
              <div class="flex min-w-0 items-center gap-1">
                <component
                  :is="titleAs"
                  :class="mergedUi.title"
                >
                  {{ title }}
                </component>
                <TileHintTooltip
                  v-if="tooltip"
                  :text="tooltip"
                  :label="title"
                />
              </div>
            </div>
            <UButton
              v-if="resolvedClose.show"
              ref="closeButtonRef"
              v-bind="resolvedClose.buttonProps"
              :class="[
                mergedUi.closeButton,
                disabled ? 'relative z-[11]' : undefined,
              ]"
              @click="handleClose"
            >
              <UIcon
                :name="closeIcon"
                class="size-4"
                aria-hidden="true"
              />
            </UButton>
          </div>
          <p
            v-if="description"
            class="mt-1 text-sm text-muted"
          >
            {{ description }}
          </p>
          <div
            v-if="$slots.header"
            :inert="inertValue"
          >
            <slot name="header" />
          </div>
        </div>
      </template>

      <div :inert="inertValue">
        <slot />
      </div>

      <template v-if="$slots.footer" #footer>
        <slot name="footer" />
      </template>
    </UCard>
    <div
      v-if="disabled"
      :class="mergedUi.overlay"
      aria-hidden="true"
    />
  </div>
</template>
