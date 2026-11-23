/**
 * @altafusion/test-kit — Test kit (Vitest, Nuxt test utils, MSW)
 *
 * Centralized Vitest, Nuxt test utils, MSW setup.
 * Pattern inspired by UnoCSS.
 *
 * @example
 * import { baseTestConfig } from '@altafusion/test-kit'
 * import { defineVitestProject } from '@altafusion/test-kit/nuxt'
 * See README.md for full usage examples.
 */

export { baseTestConfig, sharedVitestConfig } from '@altafusion/test-kit/vitest'
export { defineVueAppVitestConfig } from './vitest-app.ts'
export type { UserWorkspaceConfig } from 'vitest/config'
