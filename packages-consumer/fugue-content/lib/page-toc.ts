/** Shape of Nuxt Content `body.toc` on parsed markdown pages. */
export interface FugueContentPageTocLink {
  id: string
  depth: number
  text: string
}

export function fugueContentPageTocLinks(body: unknown): FugueContentPageTocLink[] {
  if (!body || typeof body !== 'object')
    return []

  const toc = (body as { toc?: { links?: FugueContentPageTocLink[] } }).toc
  return toc?.links ?? []
}
