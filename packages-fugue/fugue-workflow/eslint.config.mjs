// @ts-check
import { createVuePackageEslintConfig } from '@altafusion/eslint-config'

/** Engine + wizard Vue SFCs — same base as fugue-ui. */
export default createVuePackageEslintConfig({
  ignores: ['playground/**'],
  rules: {
    'no-unused-vars': 'off',
  },
})
