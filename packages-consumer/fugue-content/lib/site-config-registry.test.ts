import { describe, expect, it } from 'vitest'
import { fugueContentStudioSection } from './site-config-registry'

describe('fugueContentStudioSection', () => {
  it('keeps the stack repository as the default target', () => {
    const { studio } = fugueContentStudioSection({ rootDir: 'apps/x', messagePrefix: 'content:' })
    expect(studio.repository).toMatchObject({ owner: 'altafusion', repo: 'altafusion-monorepo', rootDir: 'apps/x' })
  })

  it('lets a standalone site name its own repository', () => {
    const { studio } = fugueContentStudioSection({
      rootDir: '.',
      messagePrefix: 'content:',
      owner: 'someone',
      repo: 'my-site'
    })
    expect(studio.repository).toMatchObject({
      owner: 'someone',
      repo: 'my-site',
      branch: 'main',
      rootDir: '.'
    })
  })
})
