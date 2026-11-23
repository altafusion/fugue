// @ts-check
import { createVuePackageEslintConfig } from '@altafusion/eslint-config'

/** Playground app — same ESLint base as fugue-theme. */
export default createVuePackageEslintConfig({
  rules: {
    'no-unused-vars': 'off',
  },
})
