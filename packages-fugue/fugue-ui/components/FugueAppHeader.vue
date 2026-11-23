<script setup lang="ts">
import type { FugueHeaderVisualStyle } from '../lib/fugue-header-visual-style'
import type { FugueNavItem } from './fugue-app-header-types'
import { isLandingHeaderStyle } from '../lib/fugue-header-visual-style'
import FugueAppHeaderDefault from './FugueAppHeaderDefault.vue'
import FugueAppHeaderLanding from './FugueAppHeaderLanding.vue'

export type { FugueHeaderVisualStyle } from '../lib/fugue-header-visual-style'
export type { FugueNavItem } from './fugue-app-header-types'

const {
  visualStyle = 'default',
  title,
  navItems = [],
  activeNavId,
  showColorMode = true,
  homeTo = '/',
} = defineProps<{
  visualStyle?: FugueHeaderVisualStyle
  title?: string
  navItems?: FugueNavItem[]
  activeNavId?: string
  showColorMode?: boolean
  homeTo?: string
}>()

const styleComponent = computed(() =>
  isLandingHeaderStyle(visualStyle)
    ? FugueAppHeaderLanding
    : FugueAppHeaderDefault,
)

const childProps = computed(() => {
  const base = {
    title,
    navItems,
    activeNavId,
    showColorMode,
    homeTo,
  }
  if (isLandingHeaderStyle(visualStyle)) {
    return {
      ...base,
      visualStyle: visualStyle as 'landing-fixed' | 'landing-static',
    }
  }
  return base
})
</script>

<template>
  <component
    :is="styleComponent"
    v-bind="childProps"
  >
    <template
      v-for="(_, name) in $slots"
      #[name]="slotData"
    >
      <slot
        :name="name"
        v-bind="slotData ?? {}"
      />
    </template>
  </component>
</template>
