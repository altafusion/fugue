<script setup lang="ts">
const { title } = usePageChrome()
const { showHeader, showFooter, mainPadding } = useShellChrome()
const { brand } = useShellSiteHeader()
const footerRight = useShellFooterRight()
</script>

<template>
  <div class="shell flex min-h-dvh min-w-0 flex-col overflow-x-clip">
    <ShellSiteHeader
      v-if="showHeader"
      class="shrink-0"
    >
      <template #logo>
        <slot name="header-logo" />
      </template>
    </ShellSiteHeader>

    <main
      class="shell-main min-h-0 w-full flex-1"
      :class="{ 'shell-main--padded': mainPadding }"
    >
      <ShellPageHeader v-if="title" :title="title" />
      <slot />
    </main>

    <footer
      v-if="showFooter"
      class="shell-footer shrink-0"
    >
      <slot name="footer">
        <div class="shell-footer__inner">
          <p class="shell-footer__default">
            © {{ new Date().getFullYear() }} {{ brand.name }}
          </p>
          <Component
            :is="footerRight"
            v-if="footerRight"
          />
        </div>
      </slot>
    </footer>
  </div>
</template>

<style scoped>
.shell-main--padded {
  padding: var(--space-6, 1.5rem);
}

.shell-footer {
  border-top: 1px solid var(--color-border, rgb(255 255 255 / 0.12));
  padding: var(--space-4, 1rem) var(--space-6, 1.5rem);
}

.shell-footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4, 1rem);
}

.shell-footer__default {
  margin: 0;
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text-secondary, #a1a1aa);
}
</style>
