<script setup lang="ts">
import { summarizePackageVersions } from '#devtools/utils/altafusionPackages'
import { formatAppInfo } from '#devtools/utils/appInfo'

/** Built-in public section: safe for any visitor to see, and handy to paste into a bug report. */
const route = useRoute()
const colorMode = useColorMode()
const width = ref(window.innerWidth)
const height = ref(window.innerHeight)

function measure() {
  width.value = window.innerWidth
  height.value = window.innerHeight
}

onMounted(() => window.addEventListener('resize', measure))
onBeforeUnmount(() => window.removeEventListener('resize', measure))

const app = formatAppInfo(useRuntimeConfig().public.fugueDevtools.app)

const rows = computed(() => ({
  ...(app
    ? { app }
    : {}),
  url: route.fullPath,
  viewport: `${width.value}x${height.value}`,
  theme: colorMode.value,
  language: navigator.language,
  userAgent: navigator.userAgent,
}))

const packages = useRuntimeConfig().public.fugueDevtools.packages ?? {}
const summary = summarizePackageVersions(packages)

const copied = ref(false)

async function copy() {
  await navigator.clipboard.writeText(JSON.stringify({ ...rows.value, altafusion: packages }, null, 2))
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}

// A transparent card with the stronger `accented` border, so it reads on the drawer's solid background.
const cardUi = { root: 'bg-transparent ring-accented', header: 'px-3 py-2 sm:px-3', body: 'p-3 sm:p-3' }
</script>

<template>
  <div class="grid w-full gap-4 text-sm sm:grid-cols-2">
    <UCard :ui="cardUi">
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <span class="font-medium">Page</span>
          <UButton
            :label="copied ? 'Copied' : 'Copy Diagnostics'"
            :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
            size="xs"
            color="neutral"
            variant="outline"
            @click="copy"
          />
        </div>
      </template>

      <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <template
          v-for="(value, key) in rows"
          :key="key"
        >
          <dt class="text-muted">
            {{ key }}
          </dt>
          <dd class="break-all font-mono text-xs">
            {{ value }}
          </dd>
        </template>
      </dl>
    </UCard>

    <UCard :ui="cardUi">
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <span class="font-medium">Altafusion Packages</span>
          <UBadge
            :label="`${summary.count} installed`"
            size="sm"
            color="neutral"
            variant="subtle"
          />
        </div>
      </template>

      <UEmpty
        v-if="!summary.count"
        icon="i-lucide-package"
        title="No Packages Found"
        description="The site's @altafusion packages were not found at build time."
        size="sm"
        variant="naked"
      />

      <div
        v-else
        class="space-y-3"
      >
        <p
          v-if="summary.uniform"
          class="text-muted"
        >
          All {{ summary.count }} packages are on version
          <UBadge
            :label="summary.groups[0]!.version"
            size="sm"
            color="primary"
            variant="subtle"
          />
        </p>

        <div
          v-for="group in summary.groups"
          :key="group.version"
          class="space-y-1"
        >
          <p
            v-if="!summary.uniform"
            class="font-mono text-xs"
          >
            {{ group.version }} ({{ group.names.length }})
          </p>
          <div class="flex flex-wrap gap-1">
            <UBadge
              v-for="name in group.names"
              :key="name"
              :label="name"
              size="sm"
              color="neutral"
              variant="outline"
            />
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
