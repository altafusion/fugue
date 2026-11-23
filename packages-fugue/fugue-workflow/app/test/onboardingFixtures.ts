import type { ActionFn, GuardFn, HandlerRegistry, ValidatorFn, WorkflowConfig } from '#orchestrator'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadWorkflow, RecoverableActionError } from '#orchestrator'

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '../..')

const onboardingYamlPath = join(
  packageRoot,
  'playground/app/workflows/user-onboarding.yaml',
)

export function loadOnboardingYaml(): string {
  return readFileSync(onboardingYamlPath, 'utf8')
}

export function loadOnboardingConfig(): WorkflowConfig {
  const registry = createFastOnboardingRegistry()
  return loadWorkflow(loadOnboardingYaml(), registry)
}

export interface FastRegistryOptions {
  /** When set, `displayNameValid` resolves after this delay (focus regression). */
  displayNameValidDelayMs?: number
}

/** Same behavior as playground registry without simulated latency. */
export function createFastOnboardingRegistry(
  options: FastRegistryOptions = {},
): HandlerRegistry {
  const showAdminShortcuts: GuardFn = (ctx) => {
    return ctx.role === 'admin' && ctx.layout === 'dense'
  }

  const loadTeamFocusOptions = async () => ['platform-ops', 'ml-research', 'customer-delivery']
  const loadLayoutOptions = async () => ['dense', 'guided']

  const displayNameValid: ValidatorFn = async (value) => {
    if (options.displayNameValidDelayMs)
      await new Promise(resolve => setTimeout(resolve, options.displayNameValidDelayMs))

    if (value == null || String(value).trim() === '')
      return 'Home label is required'

    const label = String(value).trim()
    if (label === 'BLOCK-ME')
      return 'Label BLOCK-ME is not allowed — change the text to continue'

    return null
  }

  const submitUserOnboarding: ActionFn = async (ctx) => {
    const displayName = String(ctx.displayName ?? '').trim()
    if (displayName === 'INVALID-RECOVER') {
      throw new RecoverableActionError(
        'That home label cannot be submitted — update resources and try again.',
        'resources',
      )
    }

    return {
      onboardingId: `OB-test`,
      welcomeCode: `WEL-TEST`,
    }
  }

  return {
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
}
