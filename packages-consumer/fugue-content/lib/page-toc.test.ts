import { describe, expect, it } from 'vitest'
import { fugueContentPageTocLinks } from './page-toc'

describe('fugueContentPageTocLinks', () => {
  it('returns empty array when body is missing or has no toc', () => {
    expect(fugueContentPageTocLinks(undefined)).toEqual([])
    expect(fugueContentPageTocLinks({})).toEqual([])
    expect(fugueContentPageTocLinks({ toc: {} })).toEqual([])
  })

  it('returns toc links from parsed page body', () => {
    const links = [
      { id: 'hours', depth: 2, text: 'Hours' }
    ]
    expect(fugueContentPageTocLinks({
      toc: { links }
    })).toEqual(links)
  })
})
