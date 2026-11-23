/**
 * @altafusion/test-kit — Playwright preset for repo-root E2E (Chromium + WebKit).
 */

import { defineConfig, devices, type PlaywrightTestConfig } from '@playwright/test'

/** Must end with `/` so relative `page.goto('./')` resolves against the app origin. */
export const defaultPlaywrightBaseURL = `${(
  process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:8001'
).replace(/\/?$/, '/')}`

const defaultProjects: NonNullable<PlaywrightTestConfig['projects']> = [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
]

const defaultUse: PlaywrightTestConfig['use'] = {
  baseURL: defaultPlaywrightBaseURL,
  ignoreHTTPSErrors: true,
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
}

/**
 * Shared Playwright defaults for Altafusion packages.
 * Pass `webServer`, `testDir` overrides, etc. from the repo-root config.
 */
export function defineFrontendPlaywrightConfig(
  overrides: PlaywrightTestConfig = {},
): ReturnType<typeof defineConfig> {
  const baseURL = overrides.use?.baseURL ?? defaultPlaywrightBaseURL

  return defineConfig({
    testDir: 'e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: [
      ['list'],
      ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ],
    ...overrides,
    use: {
      ...defaultUse,
      ...overrides.use,
      baseURL,
    },
    projects: overrides.projects ?? defaultProjects,
  })
}

export { defineConfig, devices }
export type { PlaywrightTestConfig } from '@playwright/test'
