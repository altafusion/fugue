import { baseTestConfig } from '@altafusion/test-kit'
import { defineConfig } from 'vitest/config'
import { aliasVirtual } from '../../alias'

export default defineConfig({
  resolve: {
    alias: aliasVirtual,
  },
  test: {
    ...baseTestConfig,
    include: ['src/**/*.test.ts'],
    environment: 'happy-dom',
  },
})
