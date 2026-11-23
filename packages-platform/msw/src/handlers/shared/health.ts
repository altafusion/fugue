import { http } from 'msw'
import { jsonResponse } from '../../utils/jsonResponse'

/** Optional health probe handlers apps can spread into their worker. */
export const healthHandlers = [
  http.get('*/api/health', () => jsonResponse({ ok: true })),
  http.get('*/health', () => jsonResponse({ ok: true })),
]
