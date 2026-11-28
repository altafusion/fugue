import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { summarizePackageVersions } from './altafusionPackages'
import { readAltafusionPackages } from './readAltafusionPackages'

describe('summarizePackageVersions', () => {
  it('says it once when every package is on the same version', () => {
    const summary = summarizePackageVersions({
      '@altafusion/shell': '0.6.3',
      '@altafusion/fugue-ui': '0.6.3',
      '@altafusion/fugue-content': '0.6.3',
    })
    expect(summary.uniform).toBe(true)
    expect(summary.count).toBe(3)
    expect(summary.groups).toEqual([
      {
        version: '0.6.3',
        names: ['fugue-content', 'fugue-ui', 'shell'],
      },
    ])
  })

  it('groups mixed versions, the version most packages share first', () => {
    const summary = summarizePackageVersions({
      '@altafusion/shell': '0.6.3',
      '@altafusion/fugue-ui': '0.6.3',
      '@altafusion/nuxt-studio': '1.8.2-altafusion.1',
    })
    expect(summary.uniform).toBe(false)
    expect(summary.groups.map(group => group.version)).toEqual(['0.6.3', '1.8.2-altafusion.1'])
  })

  it('handles no packages', () => {
    expect(summarizePackageVersions()).toEqual({ count: 0, groups: [], uniform: false })
  })
})

describe('readAltafusionPackages', () => {
  const dirs: string[] = []
  afterEach(() => {
    for (const dir of dirs.splice(0))
      rmSync(dir, { recursive: true, force: true })
  })

  function site(packages: Record<string, string>) {
    const root = mkdtempSync(join(tmpdir(), 'fugue-devtools-'))
    dirs.push(root)
    for (const [name, version] of Object.entries(packages)) {
      const dir = join(root, 'node_modules', name)
      mkdirSync(dir, { recursive: true })
      writeFileSync(join(dir, 'package.json'), JSON.stringify({ name, version }))
    }
    return root
  }

  it('reads the installed versions', () => {
    const root = site({ '@altafusion/shell': '0.6.3', '@altafusion/fugue-ui': '0.6.3' })
    expect(readAltafusionPackages(root)).toEqual({ '@altafusion/fugue-ui': '0.6.3', '@altafusion/shell': '0.6.3' })
  })

  it('returns nothing when the scope is not installed', () => {
    expect(readAltafusionPackages(site({}))).toEqual({})
  })
})
