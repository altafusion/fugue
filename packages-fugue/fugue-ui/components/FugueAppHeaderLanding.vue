<script setup lang="ts">
import type { FugueNavItem } from './fugue-app-header-types'

const {
  visualStyle,
  navItems = [],
  showColorMode = true,
  homeTo = '/',
} = defineProps<{
  visualStyle: 'landing-fixed' | 'landing-static'
  navItems?: FugueNavItem[]
  showColorMode?: boolean
  homeTo?: string
}>()

const { navOpen, scrolled, closeNav, toggleNav } = useFugueAppHeaderChrome()

const isFixed = computed(() => visualStyle === 'landing-fixed')
</script>

<template>
  <header
    class="landing-header"
    :class="[
      isFixed ? 'landing-header--fixed' : 'landing-header--static',
      scrolled ? 'landing-header--scrolled' : '',
    ]"
  >
    <div class="landing-header__bar">
      <NuxtLink
        :to="homeTo"
        class="landing-header__home"
        @click="closeNav"
      >
        <slot name="logo" />
      </NuxtLink>

      <nav>
        <button
          type="button"
          class="landing-header__menu-btn"
          :aria-expanded="navOpen"
          aria-controls="landing-nav"
          @click="toggleNav"
        >
          <UIcon
            :name="navOpen ? 'i-lucide-x' : 'i-lucide-menu'"
            class="landing-header__menu-icon"
            aria-hidden="true"
          />
          <span class="sr-only">{{ navOpen ? 'Close menu' : 'Open menu' }}</span>
        </button>

        <ul
          id="landing-nav"
          class="landing-header__nav"
          :class="navOpen ? 'landing-header__nav--open' : ''"
        >
          <li
            v-for="item in navItems"
            :key="item.id ?? item.to"
          >
            <a
              :href="item.to"
              class="landing-header__link"
              @click="closeNav"
            >
              {{ item.label }}
            </a>
          </li>
          <li class="landing-header__actions">
            <slot name="actions" />
            <UColorModeButton
              v-if="showColorMode"
              class="px-1.5"
            />
            <div class="landing-header__right">
              <slot name="right" />
            </div>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
