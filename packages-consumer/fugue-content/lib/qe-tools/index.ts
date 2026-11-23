/* eslint-disable no-console -- console API is the operator surface for qeTools */

import type { QeTools } from './types'
import { createStudioDraftsApi } from './studio-drafts'

export { createStudioDraftsApi, STUDIO_DRAFT_DB } from './studio-drafts'
export type {
  StudioDraftKind,
  StudioDraftRecord,
  StudioDraftsApi,
  StudioDraftStatus,
  StudioDraftSummary
} from './studio-drafts'
export type { QeTools } from './types'

export function createQeTools(): QeTools {
  const studioDrafts = createStudioDraftsApi()

  return {
    studioDrafts,
    help() {
      console.info(`qeTools — Fugue Content troubleshooting (browser console)

Studio drafts (IndexedDB on production Netlify — not local dev disk):
  await qeTools.studioDrafts.list()
  await qeTools.studioDrafts.get('en/fragments/location.md')
  await qeTools.studioDrafts.deleteOne('en/fragments/location.md')
  await qeTools.studioDrafts.deleteMatching('location')
  await qeTools.studioDrafts.clearAll()
  await qeTools.studioDrafts.clearMedia()

After delete/clear: hard refresh (Cmd+Shift+R / Ctrl+Shift+R).
Docs: developer-docs User Content Workflows → Undo and Revert`)
    }
  }
}
