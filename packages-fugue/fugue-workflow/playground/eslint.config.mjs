// @ts-check
import { createVuePackageEslintConfig } from '@altafusion/eslint-config'

/** Playground app — same ESLint base as fugue-workflow. */
export default createVuePackageEslintConfig({
  rules: {
    'no-unused-vars': 'off',
  },
})
