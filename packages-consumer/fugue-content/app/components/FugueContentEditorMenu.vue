<script setup lang="ts">
const { user } = useFugueContentStudioSession()
const { signOut } = useFugueContentAuthSignOut()

const menuOpen = ref(false)

const accountLabel = computed(() => user.value?.name ?? user.value?.email ?? 'Account')

const avatarFallback = computed(() => {
  const label = user.value?.name ?? user.value?.email ?? '?'
  return label.charAt(0).toUpperCase()
})

const avatarSrc = computed(() => user.value?.avatar || undefined)

function onSignOut() {
  menuOpen.value = false
  void signOut()
}
</script>

<template>
  <UPopover
    v-model:open="menuOpen"
    :content="{ align: 'end' }"
  >
    <button
      type="button"
      class="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-highlighted ring-1 ring-border transition-colors hover:bg-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      :aria-label="accountLabel"
      :aria-expanded="menuOpen"
    >
      <UAvatar
        :src="avatarSrc"
        :alt="accountLabel"
        size="sm"
        :text="avatarFallback"
      />
    </button>

    <template #content>
      <ul class="flex min-w-40 flex-col py-1">
        <li>
          <button
            type="button"
            class="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted"
            @click="onSignOut"
          >
            <UIcon
              name="i-lucide-door-open"
              class="size-4 shrink-0"
              aria-hidden="true"
            />
            Sign Out
          </button>
        </li>
      </ul>
    </template>
  </UPopover>
</template>
