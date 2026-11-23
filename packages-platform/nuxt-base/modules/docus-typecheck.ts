import type { Nuxt } from 'nuxt/schema'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { defineNuxtModule } from '@nuxt/kit'

interface PrepareTypesRefs {
  types?: string
  path?: string
}

interface TsConfigLike {
  include?: string[]
  exclude?: string[]
  compilerOptions?: Record<string, unknown>
}

/**
 * Docus vendor typecheck guards:
 * - `@nuxt/kit` emits `/// <reference types="docus" />` for every `modules`/`_modules` package id.
 *   Docus has no `types` field, so that resolves to `main` (`nuxt.config.ts`) and breaks `vue-tsc -b`.
 * - Drop those refs; layer `index.d.ts` path references still provide real Docus typings.
 * - Strip `nuxt.config.*` from generated TS `include` lists so the config file is not pulled in via glob.
 */
const DOCUS_VENDOR_SOURCE_EXCLUDES = [
  '**/node_modules/**/docus/app/**',
  '**/node_modules/**/docus/modules/**',
  '**/node_modules/**/docus/server/**',
] as const

function docusVendorPnpmExclude(pattern: (typeof DOCUS_VENDOR_SOURCE_EXCLUDES)[number]) {
  return pattern.replace('**/node_modules/**/docus/', '**/node_modules/.pnpm/docus@*/node_modules/docus/')
}

/** Merged into generated `prepare:types` projects (npm + pnpm layouts). */
export const DOCUS_VENDOR_TYPECHECK_EXCLUDES = [
  ...DOCUS_VENDOR_SOURCE_EXCLUDES,
  ...DOCUS_VENDOR_SOURCE_EXCLUDES.map(docusVendorPnpmExclude),
]

export function isDocusVendorInclude(entry: string): boolean {
  return entry.includes('/docus/nuxt.config')
    || entry.includes('/docus/app/')
    || entry.includes('/docus/modules/')
    || entry.includes('/docus/server/')
    || entry.includes('/node_modules/docus/')
    || entry.includes('/node_modules/.pnpm/docus@')
}

export function stripDocusVendorIncludes(cfg: TsConfigLike | undefined): void {
  if (cfg == null || !Array.isArray(cfg.include))
    return

  cfg.include = cfg.include.filter(
    (entry: string) => typeof entry === 'string' && !isDocusVendorInclude(entry),
  )
}

export function mergeDocusVendorExcludes(cfg: TsConfigLike | undefined): void {
  if (cfg == null)
    return

  cfg.exclude = [
    ...new Set([
      ...(cfg.exclude ?? []),
      ...DOCUS_VENDOR_TYPECHECK_EXCLUDES,
    ]),
  ]
}

export function stripDocusTypeRefs(refs: PrepareTypesRefs[] | undefined): void {
  if (refs == null)
    return

  const kept = refs.filter(r => r.types !== 'docus')
  refs.length = 0
  refs.push(...kept)
}

function isTsConfigLike(value: unknown): value is TsConfigLike {
  return value != null
    && typeof value === 'object'
    && ('include' in value || 'exclude' in value || 'compilerOptions' in value)
}

export function applyDocusVendorTypecheckGuards(payload: Record<string, unknown>): void {
  for (const value of Object.values(payload)) {
    if (isTsConfigLike(value)) {
      stripDocusVendorIncludes(value)
      mergeDocusVendorExcludes(value)
    }
  }
}

export function omitDocusPackageConfigFromNodeTs(_options: unknown, nuxt: Nuxt) {
  const patchTsConfigFile = (path: string) => {
    if (!existsSync(path))
      return

    try {
      const cfg = JSON.parse(readFileSync(path, 'utf8')) as TsConfigLike
      stripDocusVendorIncludes(cfg)
      mergeDocusVendorExcludes(cfg)
      writeFileSync(path, `${JSON.stringify(cfg, null, 2)}\n`)
    } catch (err) {
      console.warn(`[docus-typecheck] Failed to patch ${path}:`, err)
    }
  }

  const patchGeneratedTsConfigs = () => {
    for (const name of [
      'tsconfig.json',
      'tsconfig.app.json',
      'tsconfig.node.json',
      'tsconfig.shared.json',
      'tsconfig.server.json',
    ])
      patchTsConfigFile(join(nuxt.options.buildDir, name))
  }

  nuxt.hook('prepare:types', (payload) => {
    const enableDevTsImports = (cfg: TsConfigLike | undefined) => {
      if (cfg?.compilerOptions == null)
        return

      cfg.compilerOptions.allowImportingTsExtensions = true
      cfg.compilerOptions.noEmit = true
    }
    enableDevTsImports(payload.nodeTsConfig)

    applyDocusVendorTypecheckGuards(payload as Record<string, unknown>)
    stripDocusTypeRefs(payload.references)
    stripDocusTypeRefs(payload.nodeReferences)
    stripDocusTypeRefs(payload.sharedReferences)
  })
  nuxt.hook('nitro:prepare:types', (payload) => {
    applyDocusVendorTypecheckGuards(payload as Record<string, unknown>)
  })
  nuxt.hook('close', () => {
    patchGeneratedTsConfigs()
  })

  process.once('beforeExit', () => {
    patchGeneratedTsConfigs()
  })
}

export default defineNuxtModule({
  meta: {
    name: '@altafusion/nuxt-base/docus-typecheck',
    enforce: 'pre',
  },
  setup(_options, nuxt) {
    omitDocusPackageConfigFromNodeTs(_options, nuxt)
  },
})
