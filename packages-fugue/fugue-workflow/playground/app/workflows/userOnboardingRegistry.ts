import type {
  ActionFn,
  GuardFn,
  HandlerRegistry,
  LoaderFn,
  ValidatorFn,
} from '#orchestrator'
import { RecoverableActionError } from '#orchestrator'

const SIMULATED_LATENCY_MS = 400

async function simulateLatency(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, SIMULATED_LATENCY_MS))
}

/** Registry guard for field `when: showAdminShortcuts` — admin role + dense layout. */
export const showAdminShortcuts: GuardFn = (ctx) => {
  return ctx.role === 'admin' && ctx.layout === 'dense'
}

export const loadTeamFocusOptions: LoaderFn = async () => {
  await simulateLatency()
  return ['platform-ops', 'ml-research', 'customer-delivery']
}

export const loadLayoutOptions: LoaderFn = async () => {
  await simulateLatency()
  return ['dense', 'guided']
}

/** Rejects empty home label and a sentinel demo value (not recoverable). */
export const displayNameValid: ValidatorFn = (value) => {
  if (value == null || String(value).trim() === '')
    return 'Home label is required'

  const label = String(value).trim()
  if (label === 'BLOCK-ME')
    return 'Label BLOCK-ME is not allowed — change the text to continue'

  return null
}

const RESOURCES_STEP_ID = 'resources'

/**
 * Submit onboarding. Home label `INVALID-RECOVER` throws {@link RecoverableActionError}
 * back to Resources so you can exercise recovery in the UI.
 */
export const submitUserOnboarding: ActionFn = async (ctx) => {
  await simulateLatency()

  const displayName = String(ctx.displayName ?? '').trim()
  if (displayName === 'INVALID-RECOVER') {
    throw new RecoverableActionError(
      'That home label cannot be submitted — update resources and try again.',
      RESOURCES_STEP_ID,
    )
  }

  return {
    onboardingId: `OB-${Date.now()}`,
    welcomeCode: `WEL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
  }
}

export const userOnboardingRegistry: HandlerRegistry = {
  loaders: {
    loadTeamFocusOptions,
    loadLayoutOptions,
  },
  validators: {
    displayNameValid,
  },
  guards: {
    showAdminShortcuts,
  },
  actions: {
    submitUserOnboarding,
  },
}
