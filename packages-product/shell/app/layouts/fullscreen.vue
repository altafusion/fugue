<script setup lang="ts">
const { showHeader } = useShellChrome()
</script>

<template>
  <div class="shell-fullscreen flex min-h-dvh min-w-0 flex-col overflow-x-clip">
    <ShellSiteHeader
      v-if="showHeader"
      class="shrink-0"
    >
      <template #logo>
        <slot name="header-logo" />
      </template>
    </ShellSiteHeader>

    <div class="min-h-0 w-full flex-1">
      <slot />
    </div>
  </div>
</template>
