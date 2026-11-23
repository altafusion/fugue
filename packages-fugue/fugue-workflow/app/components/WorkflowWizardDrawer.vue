<script setup lang="ts">
import type { UDrawer } from '#components'
import type { DrawerSide } from '#orchestrator'
import {
  WIZARD_DRAWER_BODY_CLASS,
  WIZARD_DRAWER_HEADER_UI,
  WIZARD_DRAWER_SIZE_CLASSES,
  WIZARD_ROOT_CLASS,
} from '../theme'

type UDrawerProps = InstanceType<typeof UDrawer>['$props']

defineOptions({
  name: 'WorkflowWizardDrawer',
})

const {
  title = undefined,
  description = undefined,
  relocatable = false,
  nested = false,
  dismissible = true,
  handle = true,
  close = true,
  headerUi = undefined,
  bodyClass = undefined,
} = defineProps<{
  title?: string
  description?: string
  relocatable?: boolean
  nested?: boolean
  dismissible?: boolean
  handle?: boolean
  close?: UDrawerProps['close']
  /** Shallow-merged over `WIZARD_DRAWER_HEADER_UI` (partial slot overrides). */
  headerUi?: Partial<Record<keyof typeof WIZARD_DRAWER_HEADER_UI, string>>
  /** Drawer body slot class (default `overflow-y-auto`). */
  bodyClass?: string
}>()
const open = defineModel<boolean>('open', { required: true })
const side = defineModel<DrawerSide>('side', { required: true })

const drawerUi = computed(() => ({
  ...WIZARD_DRAWER_HEADER_UI,
  ...headerUi,
  content: `${WIZARD_ROOT_CLASS} ${WIZARD_DRAWER_SIZE_CLASSES[side.value]}`,
  body: bodyClass ?? WIZARD_DRAWER_BODY_CLASS,
}))
</script>

<template>
  <UDrawer
    :key="side"
    v-model:open="open"
    :direction="side"
    :title="title"
    :description="description"
    :dismissible="dismissible"
    :nested="nested"
    :handle="handle"
    :close="close"
    :ui="drawerUi"
  >
    <template
      v-if="relocatable || !!$slots.actions"
      #actions
    >
      <WorkflowWizardRelocate
        v-if="relocatable"
        v-model:side="side"
      />
      <slot name="actions" />
    </template>

    <template
      v-if="!!$slots.body"
      #body
    >
      <slot name="body" />
    </template>

    <template
      v-if="!!$slots.footer"
      #footer
    >
      <slot name="footer" />
    </template>
  </UDrawer>
</template>
