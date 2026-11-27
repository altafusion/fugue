<template>
  <UApp>
    <main class="mx-auto max-w-2xl space-y-4 p-8">
      <h1 class="text-xl font-semibold text-highlighted">
        Fugue devtools playground
      </h1>
      <p class="text-sm text-muted">
        Add <code>?qetools</code> to the URL to turn the dev tools on. Use <code>?qetools=off</code> to turn them off.
        The drawer has one public section and one privileged section (visible here because this is a dev server).
      </p>
      <NuxtPage />
    </main>
    <DevToolsPanel />
  </UApp>
</template>
