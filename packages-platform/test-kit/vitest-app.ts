/**
 * Default Vitest preset for Nuxt/Vue apps — happy-dom + Vue plugin + base defaults.
 * Keeps per-app vitest.config.ts to a single import (root projects stay in sync via same defaults).
 */

import vue from '@vitejs/plugin-vue'
import { defineConfig, mergeConfig, type UserWorkspaceConfig } from 'vitest/config'
import { baseTestConfig } from '@altafusion/test-kit/vitest'

export function defineVueAppVitestConfig(testOverrides?: UserWorkspaceConfig['test']): ReturnType<typeof defineConfig> {
  return defineConfig(
    mergeConfig(
      {
        plugins: [vue()],
        test: {
          ...baseTestConfig,
          include: ['**/*.{test,spec}.{ts,tsx}'],
          environment: 'happy-dom',
          passWithNoTests: true,
        },
      },
      testOverrides ? { test: testOverrides } : {},
    ),
  )
}
