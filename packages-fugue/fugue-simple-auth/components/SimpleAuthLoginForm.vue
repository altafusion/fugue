<script setup lang="ts">
import type { UseSimpleAuthLoginOptions } from '../composables/useSimpleAuthLogin'

const {
  title,
  description,
  submitLabel = 'Continue',
  pendingLabel = 'Checking…',
  placeholder = 'Access key',
  invalidKeyMessage,
  redirectTo,
  logoSrc,
  logoAlt = '',
  logoSize = 48,
  logoClass,
  loginOptions,
} = defineProps<{
  title?: string
  description?: string
  submitLabel?: string
  pendingLabel?: string
  placeholder?: string
  invalidKeyMessage?: string
  redirectTo?: string
  /** Override `app.config` brand logo when the `#logo` slot is not used. */
  logoSrc?: string
  logoAlt?: string
  logoSize?: number
  /** Override `app.config.brand.logoClass` on the default logo. */
  logoClass?: string
  loginOptions?: Omit<UseSimpleAuthLoginOptions, 'redirectTo' | 'invalidKeyMessage'>
}>()

const brand = useAppBrand()

const resolvedLogoSrc = computed(() => logoSrc ?? brand.value.logo)
const resolvedLogoAlt = computed(() => logoAlt || brand.value.logoAlt)
const resolvedLogoClass = computed(() => logoClass ?? brand.value.logoClass)

const {
  key,
  error,
  pending,
  submit,
  config,
} = useSimpleAuthLogin({
  redirectTo: () => redirectTo,
  invalidKeyMessage,
  ...loginOptions,
})

const resolvedDescription = computed(
  () => description ?? config.loginDescription,
)
</script>

<template>
  <form
    class="simple-auth-login-form flex w-full flex-col gap-3 text-center"
    @submit.prevent="submit"
  >
    <slot name="logo">
      <SimpleAuthBrandLogo
        v-if="resolvedLogoSrc"
        class="mb-4"
        :logo="resolvedLogoSrc"
        :alt="resolvedLogoAlt"
        :size="logoSize"
        :logo-class="resolvedLogoClass"
      />
    </slot>

    <slot
      name="header"
      :title="title"
      :description="resolvedDescription"
    >
      <div
        v-if="title || resolvedDescription"
        class="w-full space-y-1 text-center"
      >
        <h2
          v-if="title"
          class="text-lg font-semibold text-highlighted"
        >
          {{ title }}
        </h2>
        <p
          v-if="resolvedDescription"
          class="text-sm text-muted"
        >
          {{ resolvedDescription }}
        </p>
      </div>
    </slot>

    <!-- Chrome expects a username field alongside password inputs -->
    <input
      type="text"
      name="username"
      autocomplete="username"
      tabindex="-1"
      aria-hidden="true"
      class="sr-only"
      value="access"
      readonly
    >

    <div class="simple-auth-login-form__controls mx-auto flex w-full max-w-xs flex-col gap-3">
      <slot
        name="field"
        :model-value="key"
        :update-model-value="(value: string) => { key = value }"
        :pending="pending"
        :placeholder="placeholder"
      >
        <UFormField
          label="Access key"
          name="password"
          required
          class="w-full"
          :ui="{ label: 'justify-center' }"
        >
          <UInput
            v-model="key"
            type="password"
            name="password"
            autocomplete="current-password"
            :placeholder="placeholder"
            size="sm"
            class="w-full"
            autofocus
            required
            :disabled="pending"
          />
        </UFormField>
      </slot>

      <slot
        v-if="error"
        name="error"
        :message="error"
      >
        <UAlert
          color="error"
          variant="subtle"
          class="w-full text-left"
          :title="error"
        />
      </slot>

      <slot
        name="submit"
        :pending="pending"
        :disabled="!key || pending"
        :submit-label="submitLabel"
        :pending-label="pendingLabel"
      >
        <UButton
          type="submit"
          size="sm"
          block
          class="w-full"
          :loading="pending"
          :disabled="!key || pending"
        >
          {{ pending ? pendingLabel : submitLabel }}
        </UButton>
      </slot>
    </div>

    <div class="w-full">
      <slot name="footer" />
    </div>
  </form>
</template>
