<script setup lang="ts">
useSeoMeta({ title: 'Dev Tools · Fugue UI Playground' })

const route = useRoute()
const router = useRouter()

function turnOn() {
  router.push({
    path: route.path,
    query: { ...route.query, qetools: '' },
  })
}
</script>

<template>
  <UContainer class="py-10">
    <div class="flex max-w-2xl flex-col gap-4">
      <h1 class="text-3xl font-semibold text-highlighted">
        Dev Tools
      </h1>
      <p class="text-muted">
        <code>&lt;DevToolsPanel /&gt;</code> is mounted once in <code>app.vue</code>. Nothing else is wired. Add
        <code>?qetools</code> to the URL (or use the button) to turn it on: a dock appears at the bottom right and opens a drawer.
        <code>?qetools=off</code> turns it off, and so does the power button in the drawer header.
      </p>
      <div>
        <UButton
          label="Turn on with ?qetools"
          color="neutral"
          variant="outline"
          @click="turnOn"
        />
      </div>
      <p class="text-muted">
        Check: the drawer opens and closes from the dock; the position buttons move the drawer to each side; the dock lines
        up with a bottom drawer's right edge; the state survives a reload; there is a public <strong>Diagnostics</strong> section and a
        <strong>Privileged</strong> one (shown here because this is a dev server); turning off then adding <code>?qetools</code>
        again brings it back.
      </p>
    </div>
  </UContainer>
</template>
