import type { Nuxt } from '@nuxt/schema'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { addComponent, addImports, createResolver, defineNuxtModule, useLogger } from '@nuxt/kit'
import { defu } from 'defu'
import { isAuthEnabledAtBuild } from '../lib/env'
import { fugueSimpleAuthDefaults } from '../types/config'

const layerRoot = fileURLToPath(new URL('..', import.meta.url))
const resolver = createResolver(import.meta.url)

/** Netlify sets NETLIFY; NETLIFY_CI covers some CI/build-runner paths. */
function isNetlifyBuild(): boolean {
  return Boolean(process.env.NETLIFY || process.env.NETLIFY_CI)
}

/** `nuxt generate` — static export; no Netlify server function is deployed. */
function isNuxtGenerate(): boolean {
  return process.argv.includes('generate')
}

/** SSR auth gate — requires `nuxt build`, not `nuxt generate`. */
function useNetlifySsrAuth(authEnabled: boolean): boolean {
  return authEnabled && !isNuxtGenerate()
}

/** Bundle these in the function — externalized vue omits server-renderer (nuxt/nuxt#30224). */
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

function configureNetlifySsr(nuxt: Nuxt) {
  // Nuxt 4 defaults externalVue: true, which externalizes vue without server-renderer subpath.
  nuxt.options.experimental.externalVue = false
  nuxt.options.nitro.preset = 'netlify'
  nuxt.options.nitro.externals = mergeInlineExternals(
    nuxt.options.nitro.externals as NitroExternals | undefined,
    VUE_SSR_INLINE
  ) as typeof nuxt.options.nitro.externals
}

function authModeStartupMessage(config: typeof fugueSimpleAuthDefaults): string {
  if (config.mode === 'full')
    return 'Mode: full (whole site gated when access key is set)'

  if (config.protectedRoutes.length)
    return `Mode: routes (public site open; gated: ${config.protectedRoutes.join(', ')})`

  return 'Mode: routes (public site open; no protected routes configured)'
}

export default defineNuxtModule({
  meta: {
    name: '@altafusion/fugue-simple-auth',
    configKey: 'fugueSimpleAuth'
  },
  defaults: fugueSimpleAuthDefaults,
  setup(options, nuxt) {
    nuxt.options.alias = defu(nuxt.options.alias, {
      '#simple-auth': layerRoot
    })

    nuxt.options.nitro = defu(nuxt.options.nitro, {
      alias: {
        '#simple-auth': layerRoot
      }
    })

    addImports([
      {
        name: 'useSimpleAuthLogin',
        from: resolver.resolve('../composables/useSimpleAuthLogin')
      },
      {
        name: 'useSimpleAuthSession',
        from: resolver.resolve('../composables/useSimpleAuthSession')
      },
      {
        name: 'useSimpleAuthSignOut',
        from: resolver.resolve('../composables/useSimpleAuthSignOut')
      },
      {
        name: 'useAppBrand',
        from: resolver.resolve('../composables/useAppBrand')
      }
    ])

    addComponent({
      name: 'SimpleAuthLoginForm',
      filePath: resolver.resolve('../components/SimpleAuthLoginForm.vue')
    })

    addComponent({
      name: 'SimpleAuthBrandLogo',
      filePath: resolver.resolve('../components/SimpleAuthBrandLogo.vue')
    })

    const config = defu(
      nuxt.options.runtimeConfig.public.fugueSimpleAuth,
      options
    ) as typeof fugueSimpleAuthDefaults

    const authEnabled = isAuthEnabledAtBuild(config.envPrefix)
    const ssrAuth = useNetlifySsrAuth(authEnabled)
    config.authRequired = ssrAuth
    nuxt.options.runtimeConfig.public.fugueSimpleAuth = config

    const logger = useLogger('fugue-simple-auth')
    logger.info(
      authEnabled
        ? authModeStartupMessage(config)
        : `Mode: ${config.mode} (inactive — no ${config.envPrefix}_ACCESS_KEY)`
    )

    if (!authEnabled)
      return

    if (authEnabled && isNuxtGenerate() && isNetlifyBuild()) {
      nuxt.hooks.hook('build:done', () => {
        logger.warn(
          'Auth env is set but the build used `nuxt generate`. '
          + 'SSR redirects were skipped — the preview gate is inactive. '
          + 'Use `nuxt build` with Package directory set for Netlify SSR auth.'
        )
      })
    }

    nuxt.options.routeRules = defu(nuxt.options.routeRules, {
      [config.loginPath]: { prerender: true },
      ...(ssrAuth
        ? {
            '/**': { ssr: true, prerender: false }
          }
        : {})
    })

    if (config.mode === 'full') {
      // Nuxt types `robots` as the full module options object. Edit `disallow`
      // through a narrower view so a partial update still typechecks.
      const options = nuxt.options as Omit<typeof nuxt.options, 'robots'> & {
        robots?: { disallow?: string | string[] }
      }
      const current = options.robots?.disallow
      const list = current == null
        ? []
        : Array.isArray(current)
          ? [...current]
          : [current]
      if (!list.includes('/'))
        list.unshift('/')
      options.robots = {
        ...options.robots,
        disallow: list
      }
    }

    nuxt.options.nitro = defu(nuxt.options.nitro, {})
    if (isNetlifyBuild() && ssrAuth)
      configureNetlifySsr(nuxt)

    nuxt.options.nitro.prerender = {
      ...nuxt.options.nitro.prerender,
      ...(ssrAuth
        ? { crawlLinks: false }
        : {}),
      routes: [
        ...(nuxt.options.nitro.prerender?.routes ?? []),
        config.loginPath
      ]
    }

    nuxt.hooks.hook('nitro:config', (nitroConfig) => {
      nitroConfig.prerender = {
        ...nitroConfig.prerender,
        ...(ssrAuth
          ? { crawlLinks: false }
          : {}),
        routes: [
          ...(nitroConfig.prerender?.routes ?? []),
          config.loginPath
        ]
      }

      if (isNetlifyBuild() && ssrAuth) {
        nitroConfig.preset = nitroConfig.preset ?? 'netlify'
        nitroConfig.externals = mergeInlineExternals(
          nitroConfig.externals as NitroExternals | undefined,
          VUE_SSR_INLINE
        ) as typeof nitroConfig.externals
      }
    })

    if (!ssrAuth)
      return

    nuxt.hooks.hook('nitro:build:public-assets', async (nitro) => {
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
    })
  }
})
