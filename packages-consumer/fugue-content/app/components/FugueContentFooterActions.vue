<script setup lang="ts">
import {
  resolveFugueContentShowFooterEdit,
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

const showEdit = computed(() => resolveFugueContentShowFooterEdit(editorChrome.value))
</script>

<template>
  <FugueContentEditContent
    v-if="showEdit"
    :require-session="false"
  />
</template>
