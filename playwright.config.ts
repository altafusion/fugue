import { defaultPlaywrightBaseURL, defineFrontendPlaywrightConfig } from '@altafusion/test-kit/playwright'

const baseURL = defaultPlaywrightBaseURL

export default defineFrontendPlaywrightConfig({
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : [
        {
          command: 'bash scripts/playwright-static-server.sh fugue-content-site',
          url: `${baseURL}`,
          reuseExistingServer: !process.env.CI,
          timeout: 600_000,
        },
      ],
})
