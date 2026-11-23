<script setup lang="ts">
const { showPeekSignOut, signOut } = useFugueContentAuthSignOut()
</script>

<template>
  <UButton
    v-if="showPeekSignOut"
    variant="ghost"
    color="neutral"
    size="sm"
    icon="i-lucide-door-open"
    label="Sign Out"
    class="px-1.5"
    @click="signOut"
  />
</template>
