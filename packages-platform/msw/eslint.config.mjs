// @ts-check
import { createPackageEslintConfig } from '@altafusion/eslint-config'

export default createPackageEslintConfig({
  rules: {
    // Mock route templates intentionally use `${…}` inside regular strings.
    'no-template-curly-in-string': 'off',
  },
})
