/**
 * @altafusion/test-kit — Nuxt test utils integration
 *
 * Re-exports defineVitestProject from @nuxt/test-utils/config for Nuxt runtime tests.
 * Use in root vitest.config.ts to add a Nuxt project.
 */

export { defineVitestProject, defineVitestConfig } from '@nuxt/test-utils/config'
