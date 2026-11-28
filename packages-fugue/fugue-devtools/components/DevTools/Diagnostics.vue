<script setup lang="ts">
/** Built-in public section: safe for any visitor to see, and handy to paste into a bug report. */
const route = useRoute()
const colorMode = useColorMode()
const api = useDevTools()
const width = ref(window.innerWidth)
const height = ref(window.innerHeight)

function measure() {
  width.value = window.innerWidth
  height.value = window.innerHeight
}

onMounted(() => window.addEventListener('resize', measure))
onBeforeUnmount(() => window.removeEventListener('resize', measure))

const rows = computed(() => ({
  url: route.fullPath,
  viewport: `${width.value}x${height.value}`,
  theme: colorMode.value,
  language: navigator.language,
  userAgent: navigator.userAgent,
}))

const copied = ref(false)

async function copy() {
  await navigator.clipboard.writeText(JSON.stringify(rows.value, null, 2))
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
  <div class="space-y-2 text-sm">
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
    <div class="flex gap-2">
      <UButton
        :label="copied ? 'Copied' : 'Copy diagnostics'"
        size="xs"
        color="neutral"
        variant="soft"
        @click="copy"
      />
      <UButton
        label="Turn off dev tools"
        size="xs"
        color="neutral"
        variant="ghost"
        @click="api.disable()"
      />
    </div>
  </div>
</template>
