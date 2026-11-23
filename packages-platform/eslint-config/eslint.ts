/**
 * Shared ESLint configurations for Altafusion packages.
 *
 * **Hybrid preset strategy**
 * - Nuxt apps and templates: `@nuxt/eslint` via the fugue-theme layer — auto-imports, layers, generated config.
 * - Workspace packages: `@antfu/eslint-config` via the factories below — standalone `eslint .` without `nuxt prepare`.
 *
 * Keep stylistic defaults in sync with `sharedModuleConfig.eslint` in `@altafusion/nuxt-base/modules.ts` (consumed by `@nuxt/eslint`).
 */

import type { Linter } from 'eslint'
import antfu from '@antfu/eslint-config'
import { sharedStylisticDefaults } from './stylistic.ts'

// Re-exported so the main entry keeps its API; `@altafusion/eslint-config/stylistic` has no lint-toolchain imports.
export { sharedStylisticDefaults }

/** Subset passed to `@antfu/eslint-config` `stylistic` (comma-dangle is enforced via rules, not Antfu `stylistic`). */
export const antfuStylisticDefaults = {
  braceStyle: sharedStylisticDefaults.braceStyle,
  indent: sharedStylisticDefaults.indent,
  quotes: sharedStylisticDefaults.quotes,
  semi: sharedStylisticDefaults.semi
}

export const baseAntfuConfig = {
  typescript: true,
  stylistic: antfuStylisticDefaults,
  rules: {
    // Off: antfu/curly requires braces whenever a test is multiline, which conflicts with curly multi-or-nest and breaks --fix.
    'antfu/curly': 'off',
    'curly': ['error', 'multi-or-nest', 'consistent'],
    'no-console': ['warn'],
    'style/comma-dangle': ['error', 'never']
  }
}

/** Shared Vue/SFC rules — script, template, style order + conventions */
export const sharedVueSfcRules: Record<string, Linter.RuleEntry> = {
  'vue/block-order': [
    'error',
    {
      order: ['script', 'template', 'style']
    }
  ],
  'vue/component-name-in-template-casing': ['error', 'PascalCase'],
  'vue/prefer-define-options': 'error'
}

/** Stricter Vue rules for reusable component packages (fugue-ui, fugue-devtools, …). */
export const strictVueComponentRules: Record<string, Linter.RuleEntry> = {
  'vue/require-prop-types': 'error',
  'vue/no-unused-components': 'error'
}

/** Prefer `@altafusion/*` and `#<scope>/` over relative paths into sibling packages or deep `../` chains. */
export const importPathRules: Record<string, Linter.RuleEntry> = {
  'ts/no-restricted-imports': [
    'warn',
    {
      patterns: [
        {
          regex: String.raw`^\.\./.*[/](fugue-ui|fugue-storage|fugue-devtools|fugue-theme|nuxt-base|eslint-config|shell|test-kit|msw)(/|$)`,
          message: 'Use @altafusion/* package imports instead of relative paths into sibling packages.'
        },
        {
          regex: String.raw`^\.\./\.\./\.\./`,
          message: 'Prefer #<scope>/ or @altafusion/* imports over three-or-more-level relative paths.'
        }
      ]
    }
  ]
}

export function createNuxtAppEslintConfig(overrides: Record<string, unknown> = {}) {
  return antfu({
    ...baseAntfuConfig,
    vue: false,
    imports: false,
    rules: {
      ...baseAntfuConfig.rules,
      ...sharedVueSfcRules,
      ...(overrides.rules as object)
    },
    ...overrides
  } as unknown as Parameters<typeof antfu>[0]) as unknown as Linter.FlatConfig[]
}

export function createPackageEslintConfig(overrides: Record<string, unknown> = {}) {
  const { ignores: ignoreOverrides, ...restOverrides } = overrides
  const ignores = [
    '**/package.json',
    '**/*.md',
    ...(Array.isArray(ignoreOverrides)
      ? ignoreOverrides as string[]
      : [])
  ]
  return antfu({
    ...baseAntfuConfig,
    vue: false,
    imports: true,
    node: true,
    ignores,
    rules: {
      ...baseAntfuConfig.rules,
      ...importPathRules,
      'ts/no-unused-vars': [
        'error',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }
      ],
      ...(restOverrides.rules as object)
    },
    ...restOverrides
  } as unknown as Parameters<typeof antfu>[0]) as unknown as Linter.FlatConfig[]
}

export function createVuePackageEslintConfig(overrides: Record<string, unknown> = {}): Linter.FlatConfig[] {
  return createPackageEslintConfig({
    ...overrides,
    vue: true,
    rules: {
      ...sharedVueSfcRules,
      ...(overrides.rules as Record<string, unknown>)
    }
  })
}

/** Vue component packages with prop-type and unused-component checks. */
export function createStrictVuePackageEslintConfig(overrides: Record<string, unknown> = {}): Linter.FlatConfig[] {
  return createVuePackageEslintConfig({
    ...overrides,
    rules: {
      ...strictVueComponentRules,
      ...(overrides.rules as Record<string, unknown>)
    }
  })
}
