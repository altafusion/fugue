import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  clickButtonByLabel,
  flushShell,
  mountWorkflowWizardShell,
  selectOption,
  selectTile,
  teardownShellHarness,
} from '../test/mountWorkflowWizardShell'
import {
  createFastOnboardingRegistry,
  loadOnboardingConfig,
} from '../test/onboardingFixtures'

describe('workflowWizardShell onboarding interactions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  afterEach(() => {
    teardownShellHarness()
    localStorage.clear()
  })

  it('blocks Continue when required role is missing, then allows after selection', async () => {
    const config = loadOnboardingConfig()
    const registry = createFastOnboardingRegistry()
    const { wrapper } = mountWorkflowWizardShell({ config, registry, routePath: '/onboarding' })

    await clickButtonByLabel(wrapper, 'Continue')
    expect(wrapper.text()).toContain('Missing required fields')

    await selectTile(wrapper, 'Builder')
    await clickButtonByLabel(wrapper, 'Continue')

    expect(wrapper.text()).toMatch(/Dense|Guided/)
    expect(wrapper.find('select.u-select-stub').exists()).toBe(true)
  })

  it('opens workspace drawer for admin and skips it for non-admin', async () => {
    const config = loadOnboardingConfig()
    const registry = createFastOnboardingRegistry()

    const admin = mountWorkflowWizardShell({ config, registry, routePath: '/onboarding' })
    await selectTile(admin.wrapper, 'Admin')
    await clickButtonByLabel(admin.wrapper, 'Continue')
    expect(admin.wrapper.find('[data-testid="workflow-drawer"]').exists()).toBe(true)
    expect(admin.wrapper.text()).toContain('Workspace Focus')
    teardownShellHarness()

    const viewer = mountWorkflowWizardShell({ config, registry, routePath: '/onboarding' })
    await selectTile(viewer.wrapper, 'Viewer')
    await clickButtonByLabel(viewer.wrapper, 'Continue')
    expect(viewer.wrapper.find('[data-testid="workflow-drawer"]').exists()).toBe(false)
    expect(viewer.wrapper.text()).toMatch(/Dense|Guided/)
  })

  it('shows adminShortcuts only when guard passes (admin + dense layout)', async () => {
    const config = loadOnboardingConfig()
    const registry = createFastOnboardingRegistry()
    const { wrapper, route } = mountWorkflowWizardShell({ config, registry, routePath: '/onboarding' })

    await selectTile(wrapper, 'Admin')
    await clickButtonByLabel(wrapper, 'Continue')
    await selectOption(wrapper, 'platform-ops')
    await clickButtonByLabel(wrapper, 'Continue')
    await selectOption(wrapper, 'dense')
    await clickButtonByLabel(wrapper, 'Continue')

    expect(route.path).toMatch(/resources/)
    expect(wrapper.findAll('.u-switch-stub').length).toBe(5)

    teardownShellHarness()
    localStorage.clear()
    setActivePinia(createPinia())

    const guided = mountWorkflowWizardShell({ config, registry, routePath: '/onboarding' })
    await selectTile(guided.wrapper, 'Admin')
    await clickButtonByLabel(guided.wrapper, 'Continue')
    await selectOption(guided.wrapper, 'platform-ops')
    await clickButtonByLabel(guided.wrapper, 'Continue')
    await selectOption(guided.wrapper, 'guided')
    await clickButtonByLabel(guided.wrapper, 'Continue')

    expect(guided.route.path).toMatch(/resources/)
    expect(guided.wrapper.findAll('.u-switch-stub').length).toBe(4)
  })

  it('restores persisted context after remount', async () => {
    const config = loadOnboardingConfig()
    const registry = createFastOnboardingRegistry()

    const first = mountWorkflowWizardShell({ config, registry, routePath: '/onboarding' })
    await selectTile(first.wrapper, 'Viewer')
    await clickButtonByLabel(first.wrapper, 'Continue')
    await selectOption(first.wrapper, 'guided')
    await clickButtonByLabel(first.wrapper, 'Continue')
    teardownShellHarness()

    const second = mountWorkflowWizardShell({
      config,
      registry,
      routePath: '/onboarding/resources',
    })
    await flushShell()

    expect(second.route.path).toMatch(/resources/)
    expect(second.wrapper.find('input.u-input-stub').exists()).toBe(true)
  })

  it('recoverable submit error returns to resources with onError stay', async () => {
    const config = loadOnboardingConfig()
    const registry = createFastOnboardingRegistry()
    const { wrapper, route } = mountWorkflowWizardShell({ config, registry, routePath: '/onboarding' })

    await selectTile(wrapper, 'Viewer')
    await clickButtonByLabel(wrapper, 'Continue')
    await selectOption(wrapper, 'guided')
    await clickButtonByLabel(wrapper, 'Continue')

    const nameInput = wrapper.find('input.u-input-stub')
    await nameInput.setValue('INVALID-RECOVER')
    await flushShell()
    await clickButtonByLabel(wrapper, 'Continue')

    await clickButtonByLabel(wrapper, 'Complete Onboarding')
    await flushShell()

    expect(route.path).toMatch(/resources/)
    expect(wrapper.text()).toContain('That home label cannot be submitted')
  })

  it('keeps focus on displayName while async validation is pending', async () => {
    const config = loadOnboardingConfig()
    const registry = createFastOnboardingRegistry({ displayNameValidDelayMs: 80 })
    const { wrapper, route } = mountWorkflowWizardShell({ config, registry, routePath: '/onboarding' })

    await selectTile(wrapper, 'Viewer')
    await clickButtonByLabel(wrapper, 'Continue')
    await selectOption(wrapper, 'guided')
    await clickButtonByLabel(wrapper, 'Continue')

    expect(route.path).toMatch(/resources/)
    const nameInput = wrapper.find('input.u-input-stub')
    expect(nameInput.exists()).toBe(true)
    const el = nameInput.element as HTMLInputElement
    el.focus()
    expect(document.activeElement).toBe(el)

    await nameInput.setValue('a')
    await flushShell()
    expect(document.activeElement).toBe(el)
    expect(nameInput.attributes('disabled')).toBeUndefined()

    await new Promise(resolve => setTimeout(resolve, 100))
    await flushShell()
    expect(document.activeElement).toBe(el)
  })
})
