<script setup lang="ts">
import {
  resolveFugueContentShowEditorMenu,
  resolveFugueContentShowHeaderActions,
} from '../../lib/studio-editor-visibility'

const runtimeConfig = useRuntimeConfig()
const { authMode, hasPeekGate } = useFugueContentAuthMode()
const { isActive, isClientReady } = useFugueContentStudioEditorEntry()
const { isAuthenticated } = useFugueContentStudioSession()
const { showPeekSignOut } = useFugueContentAuthSignOut()

const editorChrome = computed(() => ({
  authMode,
  hasStudioRoute: Boolean(runtimeConfig.public.studio?.route),
  isClientReady: isClientReady.value,
  isStudioActive: isActive.value,
  hasStudioSession: isAuthenticated.value,
  hasPeekGate,
  peekSession: null,
  peekPending: false,
  showPeekSignOut: showPeekSignOut.value,
}))

const showEditorMenu = computed(() => resolveFugueContentShowEditorMenu(editorChrome.value))
const showChrome = computed(() => resolveFugueContentShowHeaderActions(editorChrome.value))
</script>

<template>
  <div
    v-if="showChrome"
    class="flex items-center"
  >
    <FugueContentAuthSignOut v-if="hasPeekGate && showPeekSignOut && !isAuthenticated" />
    <FugueContentEditorMenu v-if="showEditorMenu" />
  </div>
</template>
