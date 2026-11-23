<template>
  <!--
    flex-1 / min-h-0: fill a parent flex column shell without Nuxt UI's default
    `min-h-[calc(100vh-header)]` (that + footer forces always-on page scroll).
  -->
  <UMain class="min-h-0 w-full flex-1">
    <UContainer>
      <UPage>
        <template v-if="$slots.aside" #left>
          <UPageAside>
            <slot name="aside" />
          </UPageAside>
        </template>

        <!-- UPage only exposes #left / #default / #right — header belongs in default slot -->
        <slot v-if="$slots.header" name="header" />
        <UPageBody>
          <slot />
        </UPageBody>
      </UPage>
    </UContainer>
  </UMain>
</template>
