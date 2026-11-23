<script setup lang="ts">
definePageMeta({
  layout: false,
  header: false,
  footer: false,
})

const brand = useAppBrand()

useSeoMeta({
  title: 'Sign in',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <UApp>
    <div class="min-h-dvh flex items-center justify-center bg-default px-4">
      <UCard class="w-full max-w-md">
        <SimpleAuthLoginForm>
          <template #header="{ description }">
            <div class="w-full space-y-1 text-center">
              <h1 class="text-xl font-semibold text-highlighted">
                {{ brand.name }}
              </h1>
              <p
                v-if="description"
                class="text-sm text-muted"
              >
                {{ description }}
              </p>
            </div>
          </template>
        </SimpleAuthLoginForm>
      </UCard>
    </div>
  </UApp>
</template>
