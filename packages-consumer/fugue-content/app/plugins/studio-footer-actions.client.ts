import type { FugueContentPublicAuthConfig } from '../../lib/header-actions-registration'
import { onNuxtReady } from '#app'
import {
  scheduleFugueContentHeaderActionsRegistration,
  shouldRegisterFugueContentHeaderActions
} from '../../lib/header-actions-registration'
import FugueContentFooterActions from '../components/FugueContentFooterActions.vue'

/**
 * Register trailing footer Edit entry after hydration.
 * Never set during SSR or the initial hydrate pass — avoids slot / ClientOnly drift.
 */
export default defineNuxtPlugin({
  name: 'fugue-content:studio-footer-actions',
  setup() {
    const publicConfig = useRuntimeConfig().public

    if (!shouldRegisterFugueContentHeaderActions(publicConfig as FugueContentPublicAuthConfig))
      return

    scheduleFugueContentHeaderActionsRegistration({
      clear: () => setShellFooterRight(null),
      register: () => setShellFooterRight(FugueContentFooterActions),
      scheduleAfterHydration: registerFn => onNuxtReady(registerFn)
    })
  }
})
