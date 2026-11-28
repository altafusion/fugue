import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createStudioDraftsApi, STUDIO_DRAFT_DB } from './studio-drafts'
import 'fake-indexeddb/auto'

type Kind = 'document' | 'media'
const dbName = (kind: Kind) => STUDIO_DRAFT_DB[kind]

/** Creates the `drafts` store the way nuxt-studio does and fills it, so the API reads a real IndexedDB. */
function seed(kind: Kind, drafts: Record<string, { status: string }>): Promise<void> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(dbName(kind))
    open.onupgradeneeded = () => open.result.createObjectStore(STUDIO_DRAFT_DB.store)
    open.onerror = () => reject(open.error)
    open.onsuccess = () => {
      const db = open.result
      const tx = db.transaction(STUDIO_DRAFT_DB.store, 'readwrite')
      for (const [key, record] of Object.entries(drafts))
        tx.objectStore(STUDIO_DRAFT_DB.store).put({ fsPath: key, ...record }, key)
      tx.oncomplete = () => {
        db.close()
        resolve()
      }
      tx.onerror = () => reject(tx.error)
    }
  })
}

function deleteDb(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

const DOCUMENT_DRAFTS = {
  'en/about.md': { status: 'updated' },
  'es/about.md': { status: 'updated' },
  'en/index.md': { status: 'created' }
}

describe('studioDrafts API on a real IndexedDB', () => {
  beforeEach(() => {
    vi.spyOn(console, 'table').mockImplementation(() => {})
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await deleteDb(dbName('document'))
    await deleteDb(dbName('media'))
  })

  it('lists the drafts with their status', async () => {
    await seed('document', DOCUMENT_DRAFTS)
    const rows = await createStudioDraftsApi().list()
    expect(rows.map(row => row.key).sort()).toEqual(['en/about.md', 'en/index.md', 'es/about.md'])
    expect(rows.find(row => row.key === 'en/index.md')?.status).toBe('created')
  })

  it('lists nothing, without throwing, when Studio never created the store', async () => {
    await expect(createStudioDraftsApi().list()).resolves.toEqual([])
  })

  it('deleteOne removes only that draft', async () => {
    await seed('document', DOCUMENT_DRAFTS)
    const api = createStudioDraftsApi()
    await api.deleteOne('en/about.md')
    expect((await api.list()).map(row => row.key).sort()).toEqual(['en/index.md', 'es/about.md'])
  })

  it('deleteMatching removes every draft whose key contains the text and returns them', async () => {
    await seed('document', DOCUMENT_DRAFTS)
    const api = createStudioDraftsApi()
    const removed = await api.deleteMatching('about')
    expect(removed.map(row => row.key).sort()).toEqual(['en/about.md', 'es/about.md'])
    expect((await api.list()).map(row => row.key)).toEqual(['en/index.md'])
  })

  it('deleteMatching removes nothing when no key matches', async () => {
    await seed('document', DOCUMENT_DRAFTS)
    const api = createStudioDraftsApi()
    expect(await api.deleteMatching('hero')).toEqual([])
    expect(await api.list()).toHaveLength(3)
  })

  it('deleteMatching with empty text matches every draft, which is why the UI disables it for empty input', async () => {
    await seed('document', DOCUMENT_DRAFTS)
    const api = createStudioDraftsApi()
    expect(await api.deleteMatching('')).toHaveLength(3)
    expect(await api.list()).toEqual([])
  })

  it('clearAll empties the document and media stores', async () => {
    await seed('document', DOCUMENT_DRAFTS)
    await seed('media', {
      'images/portrait.jpg': { status: 'created' }
    })
    const api = createStudioDraftsApi()
    await api.clearAll()
    expect(await api.list()).toEqual([])
    expect(await api.list({ kind: 'media' })).toEqual([])
  })

  it('clearAll with includeMedia false keeps the media drafts', async () => {
    await seed('document', DOCUMENT_DRAFTS)
    await seed('media', {
      'images/portrait.jpg': { status: 'created' }
    })
    const api = createStudioDraftsApi()
    await api.clearAll({ includeMedia: false })
    expect(await api.list()).toEqual([])
    expect((await api.list({ kind: 'media' })).map(row => row.key)).toEqual(['images/portrait.jpg'])
  })

  it('get returns one draft record', async () => {
    await seed('document', DOCUMENT_DRAFTS)
    expect((await createStudioDraftsApi().get('en/index.md'))?.status).toBe('created')
  })
})
