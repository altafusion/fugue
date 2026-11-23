<script setup lang="ts">
import { resolveOnboardingWorkflowKey } from '../../workflows/catalog'

defineOptions({
  name: 'OnboardingIndexRoute',
})

definePageMeta({
  layout: false,
  // Remount when crossing workflows; single flow today but keeps the deploy pattern.
  key: route => resolveOnboardingWorkflowKey(route.path),
})
</script>

<template>
  <OnboardingWorkflowView />
</template>
