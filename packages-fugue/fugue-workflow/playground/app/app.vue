<template>
  <UApp>
    <!-- Layouts only auto-apply when app.vue wraps the page; the onboarding pages opt out via
         `layout: false` and let WorkflowWizardShell mount NuxtLayout itself. -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
