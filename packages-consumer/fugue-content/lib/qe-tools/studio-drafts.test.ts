import { describe, expect, it } from 'vitest'
import { filterDraftKeys, hasStudioDraftObjectStore, STUDIO_DRAFT_DB } from './studio-drafts'

describe('studio draft DB constants', () => {
  it('matches nuxt-studio IndexedDB names', () => {
    expect(STUDIO_DRAFT_DB.document).toBe('studio-v1-document')
    expect(STUDIO_DRAFT_DB.media).toBe('studio-v1-media')
    expect(STUDIO_DRAFT_DB.store).toBe('drafts')
  })
})

describe('hasStudioDraftObjectStore', () => {
  it('returns true when drafts store exists', () => {
    expect(hasStudioDraftObjectStore({
      objectStoreNames: {
        contains: name => name === STUDIO_DRAFT_DB.store
      }
    })).toBe(true)
  })

  it('returns false when drafts store is missing', () => {
    expect(hasStudioDraftObjectStore({
      objectStoreNames: {
        contains: () => false
      }
    })).toBe(false)
  })
})

describe('filterDraftKeys', () => {
  const keys = [
    'en/fragments/location.md',
    'en/settings/site.yml',
    'es/fragments/location.md'
  ]

  it('returns keys containing substring', () => {
    expect(filterDraftKeys(keys, 'location')).toEqual([
      'en/fragments/location.md',
      'es/fragments/location.md'
    ])
  })

  it('returns all keys when substring is empty', () => {
    expect(filterDraftKeys(keys, '')).toEqual(keys)
  })

  it('returns empty when nothing matches', () => {
    expect(filterDraftKeys(keys, 'hero')).toEqual([])
  })
})
