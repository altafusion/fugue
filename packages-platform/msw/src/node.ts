import type { RequestHandler } from 'msw'
import { setupServer } from 'msw/node'

/** Vitest / Node integration tests */
export function createNodeMswServer(handlers: RequestHandler[] = []) {
  return setupServer(...handlers)
}
