export { startBrowserMsw, type StartBrowserMswOptions } from './browser'
/**
 * Browser-safe exports only (Nuxt client, Vite SPA).
 * For Node/Vitest use `@altafusion/msw/node` — do not import from the root in client code.
 */
export { type AltafusionMswEnv, isMswEnabled } from './env'
export { healthHandlers } from './handlers/shared'
export { jsonResponse } from './utils/jsonResponse'
export {
  generateMockId,
  initMockDb,
  type MockDbMode,
  resetMockDb,
  resolveMockDbMode,
} from './utils/mockDb'
export { workerOptions } from './worker-options'
