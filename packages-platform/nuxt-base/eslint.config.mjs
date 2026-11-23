// @ts-check
import { createPackageEslintConfig } from '@altafusion/eslint-config'

export default createPackageEslintConfig({
  rules: {
    'import/no-default-export': 'off',
    'no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      },
    ],
    'no-console': 'warn',
  },
})
