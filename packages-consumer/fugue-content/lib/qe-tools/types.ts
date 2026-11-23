import type { StudioDraftsApi } from './studio-drafts'

export interface QeTools {
  studioDrafts: StudioDraftsApi
  help: () => void
}

declare global {
  interface Window {
    qeTools?: QeTools
  }
}

export {}
