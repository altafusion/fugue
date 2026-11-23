<script setup lang="ts">
import type { BrandId } from '@altafusion/shell/utils/altafusionBrandTheme'

const { brand, setBrand, brands } = useBrandTheme()

const items = computed(() => brands.map(entry => ({
  label: entry.label,
  value: entry.id,
})))

const brandIds = new Set<BrandId>(['default', 'violet', 'green'])

function onSelect(value: unknown) {
  if (typeof value !== 'string' || !brandIds.has(value as BrandId))
    return
  setBrand(value as BrandId)
}
</script>

<template>
  <USelect
    :model-value="brand"
    :items="items"
    size="sm"
    class="w-28"
    aria-label="Color Theme"
    @update:model-value="onSelect"
  />
</template>
