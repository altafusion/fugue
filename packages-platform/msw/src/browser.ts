import type { RequestHandler } from 'msw'
import type { StartOptions } from 'msw/browser'
import { setupWorker } from 'msw/browser'
import { workerOptions } from './worker-options'

export interface StartBrowserMswOptions {
  handlers: RequestHandler[]
  /** e.g. `/mockServiceWorker.js` */
  serviceWorkerUrl?: string
  startOptions?: Partial<StartOptions>
}

export async function startBrowserMsw(options: StartBrowserMswOptions) {
  const worker = setupWorker(...options.handlers)
  return worker.start({
    ...workerOptions,
    ...options.startOptions,
    ...(options.serviceWorkerUrl
      ? {
          serviceWorker: { url: options.serviceWorkerUrl },
        }
      : {}),
  })
}
