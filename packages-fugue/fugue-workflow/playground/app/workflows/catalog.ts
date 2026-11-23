import type { WorkflowCatalog, WorkflowEntry, WorkflowLoadFailure } from '#orchestrator'
import { resolveWorkflowEntry, resolveWorkflowFromSources, resolveWorkflowKey, safeLoadWorkflow } from '#orchestrator'
import userOnboardingYaml from './user-onboarding.yaml?raw'
import { userOnboardingRegistry } from './userOnboardingRegistry'

function buildOnboardingCatalog(): {
  catalog: WorkflowCatalog
  failures: WorkflowLoadFailure[]
} {
  const catalog: WorkflowCatalog = {}
  const failures: WorkflowLoadFailure[] = []

  const result = safeLoadWorkflow(userOnboardingYaml, userOnboardingRegistry)
  if (result.ok) {
    catalog.userOnboarding = {
      config: result.config,
      registry: userOnboardingRegistry,
    }
  } else {
    failures.push({
      basePath: result.basePath ?? '/',
      error: result.error,
      workflow: result.workflow,
    })
    if (!result.basePath)
      console.error('User onboarding workflow failed to load:', result.error)
  }

  return { catalog, failures }
}

const { catalog, failures } = buildOnboardingCatalog()

export const onboardingWorkflowCatalog = catalog
export const onboardingWorkflowFailures = failures

export function getOnboardingWorkflowEntry(): WorkflowEntry | undefined {
  return onboardingWorkflowCatalog.userOnboarding
}

export function resolveOnboardingWorkflowKey(path: string): string {
  return resolveWorkflowKey(onboardingWorkflowCatalog, path)
}

export function resolveOnboardingWorkflowEntry(path: string): WorkflowEntry | undefined {
  return resolveWorkflowEntry(onboardingWorkflowCatalog, path)
}

export function resolveOnboardingWorkflowLoadError(path: string): string | undefined {
  // Failures only — empty catalog so we don't need trailing-slash compare helpers.
  const result = resolveWorkflowFromSources(path, {}, onboardingWorkflowFailures)
  if (result.status !== 'error' || result.error === 'No workflow matches this route.')
    return undefined
  return result.error
}
