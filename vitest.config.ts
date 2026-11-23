/**
 * Root Vitest configuration — centralized test runner
 *
 * Uses @altafusion/test-kit base config.
 * Project paths follow the package bucket layout (packages-platform, packages-product, packages-fugue, packages-consumer).
 *
 * Nuxt runtime tests: add `@nuxt/test-utils` to the app (catalog:testing), import
 * `defineVitestProject` from `@altafusion/test-kit/nuxt`, and merge `await defineVitestProject({...})`
 * into `projects` (Vitest supports async config export).
 */

import { configDefaults, defineConfig } from 'vitest/config'
import { baseTestConfig } from '@altafusion/test-kit'
import vue from '@vitejs/plugin-vue'
import { alias, aliasVirtualWorkflow } from './alias'

type PackagePrefix =
  | `packages-platform/${string}`
  | `packages-product/${string}`
  | `packages-fugue/${string}`
  | `packages-consumer/${string}`

/**
 * Vitest 5 inline projects inherit the root Vite + test config (`extends: true`).
 * Keep the v4 isolation: each project owns include/environment/plugins/aliases.
 */
const isolatedProject = {
  extends: false as const,
}

const packageProject = (
  name: string,
  includePrefix: PackagePrefix,
  environment: 'node' | 'happy-dom',
  extraExclude: string[] = [],
) => ({
  ...isolatedProject,
  ...(environment === 'happy-dom' ? { plugins: [vue()] } : {}),
  test: {
    ...baseTestConfig,
    name,
    include: [`${includePrefix}/**/*.{test,spec}.{ts,tsx}`],
    exclude: [...configDefaults.exclude, ...extraExclude],
    environment,
    passWithNoTests: true,
  },
})

const vueHappyDomProject = (name: string, includePrefix: `apps/${string}` | `templates/${string}`) => ({
  ...isolatedProject,
  plugins: [vue()],
  test: {
    ...baseTestConfig,
    name,
    include: [`${includePrefix}/**/*.{test,spec}.{ts,tsx}`],
    environment: 'happy-dom' as const,
    passWithNoTests: true,
  },
})

/** fugue-workflow wizard helpers import `#orchestrator`; isolated projects do not inherit root alias. */
const fugueWorkflowProject = () => {
  const base = packageProject('fugue-workflow', 'packages-fugue/fugue-workflow', 'happy-dom', [
    '**/playground/e2e/**',
    '**/*.interaction.test.ts',
  ])
  return {
    ...base,
    resolve: {
      alias: aliasVirtualWorkflow,
    },
  }
}

export default defineConfig({
  resolve: {
    alias,
  },
  test: {
    ...baseTestConfig,
    testTimeout: 10_000,
    passWithNoTests: true,
    include: [],
    exclude: [
      ...configDefaults.exclude,
      '**/node_modules/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/dist/**',
    ],
    projects: [
      packageProject('fugue-ui', 'packages-fugue/fugue-ui', 'happy-dom'),
      packageProject('fugue-storage', 'packages-fugue/fugue-storage', 'node'),
      packageProject('fugue-simple-auth', 'packages-fugue/fugue-simple-auth', 'node'),
      packageProject('fugue-content', 'packages-consumer/fugue-content', 'node'),
      packageProject('fugue-theme', 'packages-fugue/fugue-theme', 'node'),
      fugueWorkflowProject(),
      packageProject('shell', 'packages-product/shell', 'happy-dom'),
      packageProject('fugue-devtools', 'packages-fugue/fugue-devtools', 'happy-dom'),
      packageProject('nuxt-base', 'packages-platform/nuxt-base', 'node'),
      packageProject('test-kit', 'packages-platform/test-kit', 'node'),
      packageProject('msw', 'packages-platform/msw', 'happy-dom'),
      vueHappyDomProject('fugue-content-site', 'templates/fugue-content-site'),
    ],
  },
})
