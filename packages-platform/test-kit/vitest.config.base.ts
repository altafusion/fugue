/**
 * @altafusion/test-kit — Base Vitest configuration
 *
 * Centralized test config similar to UnoCSS patterns.
 * Consumers extend this via merge or createVitestConfig().
 */

import { configDefaults, defineConfig } from 'vitest/config'
import type { UserWorkspaceConfig } from 'vitest/config'

/**
 * Base test config — globals, env, coverage, default environment.
 * Merge this into your vitest config or use createVitestConfig().
 */
export const baseTestConfig = {
  globals: true,
  env: {
    NODE_ENV: 'test',
  },
  testTimeout: 10_000,
  hookTimeout: 10_000,
  environment: 'happy-dom',
  include: ['**/*.{test,spec}.{ts,tsx,js,jsx}'],
  exclude: [
    ...configDefaults.exclude,
    '**/node_modules/**',
    '**/dist/**',
    '**/.nuxt/**',
    '**/.output/**',
    '**/coverage/**',
  ],
  coverage: {
    provider: 'v8' as const,
    reporter: ['text', 'json', 'html'],
    reportsDirectory: './coverage',
    include: ['**/*.{ts,tsx,js,jsx}'],
    exclude: [
      ...configDefaults.exclude,
      '**/node_modules/**',
      '**/dist/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/coverage/**',
      '**/*.d.ts',
      '**/*.{test,spec}.{ts,tsx,js,jsx}',
      '**/test/**',
      '**/__tests__/**',
      '**/*.config.*',
    ],
  },
}

/**
 * Define config that extends the base.
 * Use for packages that don't need the Nuxt environment.
 */
export const sharedVitestConfig = defineConfig({
  test: baseTestConfig,
})

export default sharedVitestConfig
