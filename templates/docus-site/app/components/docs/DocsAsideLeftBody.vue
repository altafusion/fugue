<script setup lang="ts">
import { prepareSidebarNavigation } from '~/utils/prepareSidebarNavigation'

const route = useRoute()
const appConfig = useAppConfig()
const { sidebarNavigation } = useSubNavigation()
const contentNavVariants = useUIConfig('contentNavigation')

const collapsedSectionSuffixes = computed(
  () => appConfig.docsNavigation?.collapsedSectionSuffixes ?? []
)

const navigation = computed(() =>
  prepareSidebarNavigation(
    sidebarNavigation.value ?? [],
    route.path,
    collapsedSectionSuffixes.value
  )
)
</script>

<template>
  <UContentNavigation
    :key="route.path"
    :collapsible="true"
    :highlight="contentNavVariants.highlight ?? true"
    :highlight-color="contentNavVariants.highlightColor"
    :variant="contentNavVariants.variant ?? 'link'"
    :color="contentNavVariants.color"
    :navigation="navigation"
    :ui="{ linkTrailing: '' }"
  />
</template>
