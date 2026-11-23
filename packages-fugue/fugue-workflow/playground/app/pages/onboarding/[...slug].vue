<script setup lang="ts">
import { resolveOnboardingWorkflowKey } from '../../workflows/catalog'

defineOptions({
  name: 'OnboardingSlugRoute',
})

definePageMeta({
  layout: false,
  key: route => resolveOnboardingWorkflowKey(route.path),
})

/**
 * Two-file catch-all under `/onboarding` — workaround for Nuxt optional-catch-all bug
 * (nuxt#32408): `[[...slug]].vue` in a subdirectory emits a corrupted route path.
 */
</script>

<template>
  <OnboardingWorkflowView />
</template>
