import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

describe('article layouts', () => {
  it.each([
    'FugueContentLayoutArticle',
    'FugueContentLayoutArticleAside'
  ])('%s has no page-level Edit row; Studio\'s own "Edit this page" button covers it', (layout) => {
    const source = readFileSync(join(root, `app/components/${layout}.vue`), 'utf8')
    expect(source).not.toContain('FugueContentEditContent')
  })
})
