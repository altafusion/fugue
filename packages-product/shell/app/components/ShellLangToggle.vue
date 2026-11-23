<script setup lang="ts">
import { useShellFugueContentPublicConfig } from '../../lib/fugue-content-public-config'
import { localeSwitchPathBase, localeSwitchPathWithHash } from '../../lib/locale-switch-path'

const {
  variant = 'default',
  linkClass,
  showLabel = true,
} = defineProps<{
  /** `brochure` — brochure-style LangToggle (language icon + btn-inverse); `default` — globe + hover fill. */
  variant?: 'default' | 'brochure'
  /** Optional class override — a site can pass `landing-header__lang-btn`. */
  linkClass?: string
  /** Show the language name next to the icon; when false it stays available to screen readers only. */
  showLabel?: boolean
}>()

const cms = useShellFugueContentPublicConfig()
const nuxtApp = useNuxtApp()
const route = useRoute()

const locales = computed(() => cms?.filteredLocales ?? [])

const show = computed(() =>
  !!cms?.i18nEnabled
  && locales.value.length > 1,
)

const useDropdown = computed(() => locales.value.length > 2)

const currentLocale = computed(() => {
  const i18n = nuxtApp.$i18n as { locale?: { value: string } } | undefined
  return i18n?.locale?.value ?? locales.value[0]?.code ?? 'en'
})

/** Brochure-style: link to the other language(s), not the active one. */
const alternateLocales = computed(() =>
  locales.value.filter(locale => locale.code !== currentLocale.value),
)

/** After hydration, locale links may include the current in-page hash again. */
const hydrated = ref(false)
onMounted(() => {
  hydrated.value = true
})

function switchLocaleLink(code: string): string {
  const fn = nuxtApp.$switchLocalePath as ((locale: string) => string) | undefined
  const raw = fn?.(code) ?? `/${code}`
  const base = localeSwitchPathBase(raw)
  if (!hydrated.value)
    return base
  return localeSwitchPathWithHash(base, route.hash)
}

function localeLabel(code: string) {
  return locales.value.find(l => l.code === code)?.name ?? code
}

const resolvedLinkClass = computed(() => {
  if (linkClass)
    return linkClass
  if (variant === 'brochure')
    return 'inline-flex min-w-[95px] cursor-pointer items-center justify-center rounded border border-solid border-gray-600 bg-transparent p-1 text-center text-gray-500 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700'
  return 'inline-flex items-center gap-1 rounded-md px-1.5 py-1.5 text-sm font-medium text-default hover:bg-elevated active:bg-elevated'
})
</script>

<template>
  <!-- Two locales: alternate language link. -->
  <template v-if="show && !useDropdown">
    <NuxtLink
      v-for="locale in alternateLocales"
      :key="locale.code"
      :to="switchLocaleLink(locale.code)"
      :class="resolvedLinkClass"
      :aria-label="`Switch to ${locale.name ?? locale.code}`"
    >
      <UIcon
        v-if="variant === 'brochure'"
        name="i-lucide-languages"
        class="size-[1em] shrink-0"
        aria-hidden="true"
      />
      <UIcon
        v-else
        name="i-lucide-globe"
        class="size-4 shrink-0"
        aria-hidden="true"
      />
      <span :class="{ 'sr-only': !showLabel }">{{ locale.name ?? locale.code }}</span>
    </NuxtLink>
  </template>

  <!-- Three or more: globe + current language + dropdown. -->
  <UPopover
    v-else-if="show && useDropdown"
    :content="{ align: 'end' }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      size="sm"
      class="px-1.5"
      :label="localeLabel(currentLocale)"
      icon="i-lucide-globe"
      trailing-icon="i-lucide-chevron-down"
      :ui="{ leadingIcon: 'size-4' }"
      :aria-label="`Language: ${localeLabel(currentLocale)}`"
    />

    <template #content>
      <ul class="flex flex-col min-w-36 py-1">
        <li
          v-for="locale in locales"
          :key="locale.code"
        >
          <NuxtLink
            class="flex items-center justify-between py-1.5 px-3 gap-2 hover:bg-muted text-sm"
            :to="switchLocaleLink(locale.code)"
            :class="{ 'font-semibold text-highlighted': locale.code === currentLocale }"
          >
            {{ locale.name ?? locale.code }}
          </NuxtLink>
        </li>
      </ul>
    </template>
  </UPopover>
</template>
