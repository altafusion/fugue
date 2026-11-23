<script setup lang="ts">
defineOptions({
  name: 'PlaygroundHome',
})

useSeoMeta({
  title: 'Fugue Workflow Playground',
  description: 'Standalone consumer proof for @altafusion/fugue-workflow.',
})
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <UPageHeader
      title="Fugue Workflow Playground"
      description="This app extends only @altafusion/fugue-workflow — no product or shell packages — to prove the orchestrator layer is independently consumable (transitive fugue-ui / fugue-nuxt-ui only)."
    />

    <p class="text-muted">
      The sample
      <NuxtLink
        to="/onboarding"
        class="text-primary font-medium"
      >
        user onboarding
      </NuxtLink>
      flow exercises:
      <code class="text-sm">stepper.order: transition</code>,
      <code class="text-sm">context.persist: true</code>,
      branched transitions,
      drawer presentation,
      conditional step skip (admin drawer branch),
      registry guard field visibility,
      async field validation,
      fetch loaders,
      tiles/text/toggle/select inputs,
      mutate actions with recoverable errors,
      and
      <code class="text-sm">invalidatesDownstream</code>.
    </p>
  </div>
</template>
