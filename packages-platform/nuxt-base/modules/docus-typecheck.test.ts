import { describe, expect, it } from 'vitest'
import {
  applyDocusVendorTypecheckGuards,
  DOCUS_VENDOR_TYPECHECK_EXCLUDES,
  isDocusVendorInclude,
  stripDocusTypeRefs,
  stripDocusVendorIncludes,
} from './docus-typecheck'

describe('docus-typecheck', () => {
  it('includes pnpm layout exclude variants', () => {
    expect(DOCUS_VENDOR_TYPECHECK_EXCLUDES).toContain('**/node_modules/**/docus/app/**')
    expect(DOCUS_VENDOR_TYPECHECK_EXCLUDES).toContain('**/node_modules/.pnpm/docus@*/node_modules/docus/app/**')
  })

  it('flags docus vendor include paths', () => {
    expect(isDocusVendorInclude('/repo/node_modules/docus/nuxt.config.ts')).toBe(true)
    expect(isDocusVendorInclude('/repo/node_modules/.pnpm/docus@5.12.3/node_modules/docus/app/app.vue')).toBe(true)
    expect(isDocusVendorInclude('/repo/apps/developer-docs/content/index.md')).toBe(false)
  })

  it('strips docus vendor includes and merges excludes', () => {
    const cfg = {
      include: [
        './app/**/*',
        '/repo/node_modules/docus/app/app.vue',
      ],
      exclude: ['./dist'],
    }

    stripDocusVendorIncludes(cfg)

    expect(cfg.include).toEqual(['./app/**/*'])
    applyDocusVendorTypecheckGuards({ nodeTsConfig: cfg })
    expect(cfg.exclude).toEqual(expect.arrayContaining(['./dist', ...DOCUS_VENDOR_TYPECHECK_EXCLUDES]))
  })

  it('removes bogus docus type references', () => {
    const refs = [
      { types: 'docus' },
      { path: './.nuxt/nuxt.d.ts' },
    ]

    stripDocusTypeRefs(refs)

    expect(refs).toEqual([
      { path: './.nuxt/nuxt.d.ts' },
    ])
  })
})
