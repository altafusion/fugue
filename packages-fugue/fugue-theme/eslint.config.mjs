// @ts-check
import { createStrictVuePackageEslintConfig } from '@altafusion/eslint-config'

export default createStrictVuePackageEslintConfig({
  rules: {
    'vue/require-default-prop': 'error',
    'no-console': 'warn',
  },
})
