<script setup lang="ts">
const {
  title,
  brand,
  homeTo,
  navItems,
  activeNavId,
  showColorMode,
  visualStyle,
  headerActions,
  headerRight,
} = useShellSiteHeader()

const isLandingStyle = computed(() =>
  visualStyle.value === 'landing-fixed' || visualStyle.value === 'landing-static',
)

const defaultLogoClass = computed(() =>
  isLandingStyle.value ? 'landing-header__logo' : undefined,
)
</script>

<template>
  <FugueAppHeader
    :title="title"
    :home-to="homeTo"
    :nav-items="navItems"
    :active-nav-id="activeNavId"
    :show-color-mode="showColorMode"
    :visual-style="visualStyle"
  >
    <template #logo>
      <slot name="logo">
        <ShellBrandLogo
          v-if="brand.logo"
          :logo="brand.logo"
          :alt="brand.logoAlt"
          :logo-class="brand.logoClass ?? defaultLogoClass"
        />
      </slot>
    </template>

    <template #actions>
      <ShellLangToggle
        v-if="isLandingStyle"
        variant="brochure"
        link-class="landing-header__lang-btn"
      />
      <ShellLangToggle v-else />
      <component
        :is="headerActions"
        v-if="headerActions"
      />
    </template>

    <template #right>
      <component
        :is="headerRight"
        v-if="headerRight"
      />
    </template>
  </FugueAppHeader>
</template>
