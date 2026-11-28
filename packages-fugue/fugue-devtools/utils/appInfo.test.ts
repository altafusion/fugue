import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { formatAppInfo } from './appInfo'
import { readAppInfo } from './readAppInfo'

describe('formatAppInfo', () => {
  it('shows name, version and the short commit', () => {
    expect(formatAppInfo({ name: 'camilajessica', version: '0.1.0', commit: '9e5769e1234567890' })).toBe('camilajessica 0.1.0 (9e5769e)')
  })

  it('leaves out whatever is missing', () => {
    expect(formatAppInfo({ version: '0.1.0' })).toBe('0.1.0')
    expect(formatAppInfo({ commit: 'abcdef123' })).toBe('(abcdef1)')
    expect(formatAppInfo({})).toBeUndefined()
    expect(formatAppInfo()).toBeUndefined()
  })
})

describe('readAppInfo', () => {
  const dirs: string[] = []
  afterEach(() => {
    for (const dir of dirs.splice(0))
      rmSync(dir, { recursive: true, force: true })
  })

  function site(pkg: object | string) {
    const root = mkdtempSync(join(tmpdir(), 'fugue-app-info-'))
    dirs.push(root)
    writeFileSync(join(root, 'package.json'), typeof pkg === 'string'
      ? pkg
      : JSON.stringify(pkg))
    return root
  }

  it('reads the name and version, and prefers the Netlify commit', () => {
    const root = site({ name: 'camilajessica', version: '0.1.0' })
    expect(readAppInfo(root, { COMMIT_REF: 'netlify1' }, () => 'git1')).toEqual({ name: 'camilajessica', version: '0.1.0', commit: 'netlify1' })
  })

  it('falls back to GitHub, then to git', () => {
    const root = site({ name: 'a', version: '1.0.0' })
    expect(readAppInfo(root, { GITHUB_SHA: 'gh1' }, () => 'git1').commit).toBe('gh1')
    expect(readAppInfo(root, {}, () => 'git1').commit).toBe('git1')
  })

  it('keeps going when package.json cannot be read', () => {
    expect(readAppInfo(site('{ not json'), {}, () => 'git1')).toEqual({ name: undefined, version: undefined, commit: 'git1' })
  })
})
