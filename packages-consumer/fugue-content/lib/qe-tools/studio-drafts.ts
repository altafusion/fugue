/**
 * Browser-only helpers for Nuxt Studio draft storage (IndexedDB).
 * Used by operators when Studio "Revert changes" fails or drafts persist unexpectedly.
 *
 * @see developer-docs User Content Workflows — Draft Layer (Production)
 */

/* eslint-disable no-console -- console API is the operator surface for qeTools */

/** Matches nuxt-studio client storage (`studio-v1-${kind}` / store `drafts`). */
export const STUDIO_DRAFT_DB = {
  document: 'studio-v1-document',
  media: 'studio-v1-media',
  store: 'drafts'
} as const

export type StudioDraftKind = 'document' | 'media'

export type StudioDraftStatus = 'deleted' | 'created' | 'updated' | 'pristine'

export interface StudioDraftSummary {
  key: string
  fsPath?: string
  status?: StudioDraftStatus
}

export interface StudioDraftRecord {
  fsPath?: string
  status?: StudioDraftStatus
  modified?: unknown
  original?: unknown
  remoteFile?: unknown
  conflict?: unknown
  formattingApplied?: boolean
}

export interface StudioDraftsListOptions {
  kind?: StudioDraftKind
}

export interface StudioDraftsDeleteOptions {
  kind?: StudioDraftKind
}

export interface StudioDraftsClearOptions {
  /** When true (default), clears document + media draft stores. */
  includeMedia?: boolean
}

export interface StudioDraftsApi {
  /** List unpublished content file drafts (default) or media drafts. */
  list: (_options?: StudioDraftsListOptions) => Promise<StudioDraftSummary[]>
  /** Fetch one draft record by IndexedDB key (usually the content fsPath). */
  get: (_key: string, _options?: StudioDraftsDeleteOptions) => Promise<StudioDraftRecord | undefined>
  /** Remove one draft; hard-refresh the page afterward to clear Studio in-memory merge. */
  deleteOne: (_key: string, _options?: StudioDraftsDeleteOptions) => Promise<void>
  /** Remove drafts whose key contains `substring` (e.g. `"location"`). */
  deleteMatching: (_substring: string, _options?: StudioDraftsDeleteOptions) => Promise<StudioDraftSummary[]>
  /** Clear all document drafts (and media when `includeMedia` is true). */
  clearAll: (_options?: StudioDraftsClearOptions) => Promise<void>
  /** Clear media drafts only. */
  clearMedia: () => Promise<void>
  /** Log hard-refresh reminder (does not reload automatically). */
  hardRefreshHint: () => void
}

export interface StudioDraftStorageStatus {
  available: boolean
  dbName: string
  kind: StudioDraftKind
  /** Set when `available` is false — e.g. local dev uses disk, not IndexedDB drafts. */
  reason?: string
}

const PRODUCTION_DRAFTS_HINT
  = 'IndexedDB drafts exist on production (Netlify) after Studio saves unpublished edits. Local dev writes directly to disk — use git restore for local undo.'

function dbNameForKind(kind: StudioDraftKind): string {
  return kind === 'media'
    ? STUDIO_DRAFT_DB.media
    : STUDIO_DRAFT_DB.document
}

/** Exported for unit tests. */
export function hasStudioDraftObjectStore(db: Pick<IDBDatabase, 'objectStoreNames'>): boolean {
  return db.objectStoreNames.contains(STUDIO_DRAFT_DB.store)
}

async function getDraftStorageStatus(kind: StudioDraftKind): Promise<StudioDraftStorageStatus> {
  const dbName = dbNameForKind(kind)
  try {
    const db = await openDb(dbName)
    try {
      if (hasStudioDraftObjectStore(db))
        return { available: true, dbName, kind }

      return {
        available: false,
        dbName,
        kind,
        reason: db.objectStoreNames.length === 0
          ? PRODUCTION_DRAFTS_HINT
          : `Database "${dbName}" exists but has no "${STUDIO_DRAFT_DB.store}" store. ${PRODUCTION_DRAFTS_HINT}`
      }
    } finally {
      db.close()
    }
  } catch {
    return {
      available: false,
      dbName,
      kind,
      reason: PRODUCTION_DRAFTS_HINT
    }
  }
}

function warnDraftStorageUnavailable(status: StudioDraftStorageStatus): void {
  console.warn(`[qeTools.studioDrafts] No draft store at ${status.dbName}. ${status.reason ?? PRODUCTION_DRAFTS_HINT}`)
}

function openDb(dbName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName)
    request.onerror = () => reject(request.error ?? new Error(`Failed to open IndexedDB: ${dbName}`))
    request.onsuccess = () => resolve(request.result)
  })
}

async function runTransaction<T>(
  dbName: string,
  mode: IDBTransactionMode,
  fn: (_store: IDBObjectStore) => Promise<T> | T
): Promise<T> {
  const db = await openDb(dbName)
  if (!hasStudioDraftObjectStore(db)) {
    db.close()
    throw new Error(`Missing object store "${STUDIO_DRAFT_DB.store}" in ${dbName}`)
  }

  try {
    const tx = db.transaction(STUDIO_DRAFT_DB.store, mode)
    const store = tx.objectStore(STUDIO_DRAFT_DB.store)
    const result = await Promise.resolve(fn(store))
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error(`IndexedDB transaction failed: ${dbName}`))
    })
    return result
  } finally {
    db.close()
  }
}

function idbRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
  })
}

function summarizeDraft(key: IDBValidKey, record: StudioDraftRecord | undefined): StudioDraftSummary {
  return {
    key: String(key),
    fsPath: record?.fsPath,
    status: record?.status
  }
}

/** Exported for unit tests. */
export function filterDraftKeys(keys: string[], substring: string): string[] {
  if (!substring)
    return keys
  return keys.filter(key => key.includes(substring))
}

async function listDrafts(kind: StudioDraftKind): Promise<StudioDraftSummary[]> {
  const status = await getDraftStorageStatus(kind)
  if (!status.available) {
    warnDraftStorageUnavailable(status)
    return []
  }

  const dbName = dbNameForKind(kind)
  return runTransaction(dbName, 'readonly', async (store) => {
    const keys = await idbRequest(store.getAllKeys())
    const rows = await Promise.all(
      keys.map(async (key) => {
        const record = await idbRequest(store.get(key)) as StudioDraftRecord | undefined
        return summarizeDraft(key, record)
      })
    )
    return rows
  })
}

async function getDraft(key: string, kind: StudioDraftKind): Promise<StudioDraftRecord | undefined> {
  const status = await getDraftStorageStatus(kind)
  if (!status.available) {
    warnDraftStorageUnavailable(status)
    return undefined
  }

  const dbName = dbNameForKind(kind)
  return runTransaction(dbName, 'readonly', store => idbRequest(store.get(key)) as Promise<StudioDraftRecord | undefined>)
}

async function deleteDraft(key: string, kind: StudioDraftKind): Promise<boolean> {
  const status = await getDraftStorageStatus(kind)
  if (!status.available) {
    warnDraftStorageUnavailable(status)
    return false
  }

  const dbName = dbNameForKind(kind)
  await runTransaction(dbName, 'readwrite', store => idbRequest(store.delete(key)))
  return true
}

async function clearDraftStore(kind: StudioDraftKind): Promise<boolean> {
  const status = await getDraftStorageStatus(kind)
  if (!status.available) {
    warnDraftStorageUnavailable(status)
    return false
  }

  const dbName = dbNameForKind(kind)
  await runTransaction(dbName, 'readwrite', store => idbRequest(store.clear()))
  return true
}

export function createStudioDraftsApi(): StudioDraftsApi {
  const hardRefreshHint = () => {
    console.info(
      '[qeTools.studioDrafts] Hard refresh the page (Cmd+Shift+R / Ctrl+Shift+R) so Studio reloads from the last deploy.'
    )
  }

  return {
    async list(options) {
      const kind = options?.kind ?? 'document'
      const rows = await listDrafts(kind)
      console.table(rows)
      return rows
    },

    get(key, options) {
      return getDraft(key, options?.kind ?? 'document')
    },

    async deleteOne(key, options) {
      const deleted = await deleteDraft(key, options?.kind ?? 'document')
      if (!deleted)
        return

      console.info('[qeTools.studioDrafts] Deleted draft:', key)
      hardRefreshHint()
    },

    async deleteMatching(substring, options) {
      const kind = options?.kind ?? 'document'
      const rows = await listDrafts(kind)

      if (!rows.length) {
        const status = await getDraftStorageStatus(kind)
        if (!status.available)
          return []

        console.warn('[qeTools.studioDrafts] No drafts in store.')
        return []
      }

      const hits = rows.filter(row => filterDraftKeys([row.key], substring).length > 0)

      if (!hits.length) {
        console.warn('[qeTools.studioDrafts] No keys matching:', substring)
        return []
      }

      for (const row of hits)
        await deleteDraft(row.key, kind)

      console.info('[qeTools.studioDrafts] Deleted', hits.length, 'draft(s).')
      hardRefreshHint()
      return hits
    },

    async clearAll(options) {
      const clearedDocument = await clearDraftStore('document')
      const clearedMedia = options?.includeMedia !== false
        ? await clearDraftStore('media')
        : true

      if (!clearedDocument && !clearedMedia)
        return

      const scope = options?.includeMedia === false
        ? 'document drafts'
        : 'document + media drafts'
      console.info(`[qeTools.studioDrafts] Cleared ${scope}.`)
      hardRefreshHint()
    },

    async clearMedia() {
      const cleared = await clearDraftStore('media')
      if (!cleared)
        return

      console.info('[qeTools.studioDrafts] Cleared media drafts.')
      hardRefreshHint()
    },

    hardRefreshHint
  }
}
