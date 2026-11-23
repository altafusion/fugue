import type { FugueContentPublicAuthConfig } from '../../lib/header-actions-registration'
import { onNuxtReady } from '#app'
import {
  scheduleFugueContentHeaderActionsRegistration,
  shouldRegisterFugueContentHeaderActions
} from '../../lib/header-actions-registration'
import FugueContentHeaderActions from '../components/FugueContentHeaderActions.vue'

/**
 * Register trailing header editor menu after hydration.
 * Never set during SSR or the initial hydrate pass — avoids slot / ClientOnly drift.
 */
export default defineNuxtPlugin({
  name: 'fugue-content:studio-header-actions',
  setup() {
    const publicConfig = useRuntimeConfig().public

    if (!shouldRegisterFugueContentHeaderActions(publicConfig as FugueContentPublicAuthConfig))
      return

    scheduleFugueContentHeaderActionsRegistration({
      clear: () => {
        setShellHeaderActions(null)
        setShellHeaderRight(null)
      },
      register: () => setShellHeaderRight(FugueContentHeaderActions),
      scheduleAfterHydration: registerFn => onNuxtReady(registerFn)
    })
  }
})
