<script setup lang="ts">
import { resolveFugueContentLoginRedirect } from '../../lib/login-redirect'

definePageMeta({
  layout: false,
  header: false,
  footer: false,
})

const route = useRoute()
const { authMode } = useFugueContentAuthMode()
const { isAuthenticated, pending, activateDevSession } = useFugueContentStudioSession()
const studioConfig = useRuntimeConfig().public.studio

const redirectTo = computed(() => resolveFugueContentLoginRedirect(route.query.redirect))

useSeoMeta({
  title: 'Sign in',
  robots: 'noindex, nofollow',
})

const started = ref(false)

function goToStudioOAuth(redirectPath: string) {
  const redirect = encodeURIComponent(redirectPath)
  window.location.assign(`${studioConfig!.route}?redirect=${redirect}`)
}

async function completeStudioLogin() {
  if (started.value || authMode !== 'studio')
    return

  if (pending.value)
    return

  started.value = true

  if (isAuthenticated.value) {
    await navigateTo(redirectTo.value)
    return
  }

  if (import.meta.dev) {
    activateDevSession()
    await nextTick()
    await navigateTo(redirectTo.value)
    return
  }

  goToStudioOAuth(redirectTo.value)
}

watch([pending, isAuthenticated], () => {
  if (import.meta.client)
    void completeStudioLogin()
}, { immediate: true })
</script>

<template>
  <UApp>
    <div
      v-if="authMode === 'studio'"
      class="min-h-dvh flex items-center justify-center bg-default px-4"
    >
      <p class="text-sm text-muted">
        Redirecting to sign in…
      </p>
    </div>
  </UApp>
</template>
