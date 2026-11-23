import type { NuxtConfig } from 'nuxt/schema'
import process from 'node:process'
import { isAuthEnabledAtBuild } from '@altafusion/fugue-simple-auth/lib/env'

/** Netlify sets NETLIFY; NETLIFY_CI covers some CI/build-runner paths. */
function isNetlifyBuild(): boolean {
  return Boolean(process.env.NETLIFY || process.env.NETLIFY_CI)
}

function isNuxtGenerate(): boolean {
  return process.argv.includes('generate')
}

const VUE_SSR_INLINE = ['vue', '@vue/server-renderer', 'vue/server-renderer'] as const

interface NitroExternals { inline?: (string | RegExp)[] }

function mergeInlineExternals(
  externals: NitroExternals | undefined,
  additions: readonly string[]
): NitroExternals {
  const existing = externals?.inline ?? []
  const inline = [
    ...existing,
    ...additions
  ]
  return {
    ...externals,
    inline: [
      ...new Set(inline)
    ]
  }
}

/**
 * Netlify SSR for Studio-only apps (no fugue-simple-auth peek gate).
 * Enabled when **`SITE_AUTH_ENABLED=true`** at build — same flag as auth-gated sites.
 */
export function buildFugueContentSiteNetlifySsrConfig(envPrefix = 'SITE'): NuxtConfig | undefined {
  if (!isAuthEnabledAtBuild(envPrefix))
    return undefined

  if (isNuxtGenerate())
    return undefined

  return {
    experimental: {
      externalVue: false
    },
    routeRules: {
      '/**': { ssr: true, prerender: false }
    },
    nitro: {
      ...(isNetlifyBuild()
        ? { preset: 'netlify' as const }
        : {}),
      prerender: {
        crawlLinks: false
      },
      externals: mergeInlineExternals(undefined, VUE_SSR_INLINE)
    },
    hooks: {
      'build:done': () => {
        if (isNetlifyBuild() && isNuxtGenerate()) {
          console.warn(
            '[fugue-content-site] SITE_AUTH_ENABLED is set but the build used `nuxt generate`. '
            + 'Studio OAuth requires `nuxt build` + Netlify SSR.'
          )
        }
      },
      'nitro:config': (nitroConfig) => {
        nitroConfig.prerender = {
          ...nitroConfig.prerender,
          crawlLinks: false
        }

        if (isNetlifyBuild()) {
          nitroConfig.preset = nitroConfig.preset ?? 'netlify'
          nitroConfig.externals = mergeInlineExternals(
            nitroConfig.externals as NitroExternals | undefined,
            VUE_SSR_INLINE
          ) as typeof nitroConfig.externals
        }
      },
      'nitro:build:public-assets': async (nitro) => {
        if (!isNetlifyBuild())
          return

        const { readFile, writeFile } = await import('node:fs/promises')
        const { join } = await import('node:path')
        const redirectsPath = join(nitro.options.output.publicDir, '_redirects')
        const catchAll = [
          '/_nuxt/* /_nuxt/:splat 200',
          '/* /.netlify/functions/server 200'
        ].join('\n')

        let existing = ''
        try {
          existing = await readFile(redirectsPath, 'utf8')
        } catch {
          // no existing redirects file
        }

        if (!/^\/\* /m.test(existing)) {
          const contents = existing.trim()
            ? `${existing.trim()}\n${catchAll}\n`
            : `${catchAll}\n`
          await writeFile(redirectsPath, contents)
        }
      }
    }
  }
}
