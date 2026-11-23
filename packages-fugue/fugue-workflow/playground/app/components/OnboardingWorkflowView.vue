<script setup lang="ts">
import {
  getOnboardingWorkflowEntry,
  onboardingWorkflowCatalog,
  onboardingWorkflowFailures,
  resolveOnboardingWorkflowEntry,
  resolveOnboardingWorkflowLoadError,
} from '../workflows/catalog'

defineOptions({
  name: 'OnboardingWorkflowView',
})

const route = useRoute()
const entry = computed(() => resolveOnboardingWorkflowEntry(route.path))
const loadError = computed(() => resolveOnboardingWorkflowLoadError(route.path))

const playgroundGlobals = {
  user: {
    id: 'playground-user',
    name: 'Playground User',
    email: 'playground@example.com',
  },
}

const wizardEntry = computed(() => entry.value ?? getOnboardingWorkflowEntry())
</script>

<template>
  <NuxtLayout
    v-if="loadError"
    name="default"
  >
    <UAlert
      color="error"
      variant="subtle"
      title="Workflow failed to load"
      :description="loadError"
    />
  </NuxtLayout>

  <WorkflowWizardShell
    v-else-if="wizardEntry"
    layout="default"
    :config="wizardEntry.config"
    :registry="wizardEntry.registry"
    :globals="playgroundGlobals"
    :catalog="onboardingWorkflowCatalog"
    :failures="onboardingWorkflowFailures"
    product-label="Onboarding"
    seo-description="Standalone fugue-workflow playground — app user onboarding."
  />
</template>
