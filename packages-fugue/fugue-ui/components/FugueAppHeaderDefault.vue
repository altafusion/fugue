<script setup lang="ts">
import type { FugueNavItem } from './fugue-app-header-types'

const {
  title,
  navItems = [],
  activeNavId,
  showColorMode = true,
  homeTo = '/',
} = defineProps<{
  title?: string
  navItems?: FugueNavItem[]
  activeNavId?: string
  showColorMode?: boolean
  homeTo?: string
}>()
</script>

<template>
  <UHeader>
    <template #left>
      <slot name="left">
        <NuxtLink
          :to="homeTo"
          class="flex items-center gap-2 text-highlighted"
        >
          <slot name="logo" />
          <span
            v-if="title"
            class="font-semibold"
          >
            {{ title }}
          </span>
        </NuxtLink>
      </slot>
    </template>

    <template #right>
      <div class="flex items-center gap-0.5">
        <slot name="nav">
          <UButton
            v-for="item in navItems"
            :key="item.id ?? item.to"
            :label="item.label"
            :to="item.to"
            :icon="item.icon"
            variant="ghost"
            color="neutral"
            size="sm"
            class="hidden px-1.5 sm:inline-flex"
            :class="{ 'font-semibold text-highlighted': activeNavId === item.id }"
          />
        </slot>

        <slot name="actions" />

        <UColorModeButton
          v-if="showColorMode"
          class="px-1.5"
        />

        <slot name="right" />
      </div>
    </template>

    <!-- Mobile menu (the hamburger drawer). Only passed through when a parent provides it. -->
    <template
      v-if="$slots.body"
      #body
    >
      <slot name="body" />
    </template>
  </UHeader>
</template>
