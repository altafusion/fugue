import type { StartOptions } from 'msw/browser'

export const workerOptions: StartOptions = {
  quiet: true,
  onUnhandledFrame: 'bypass',
}
