import type { ModuleOptions } from '@nuxtjs/i18n'
import type { FugueContentNuxtI18nOptions } from '../lib/i18n-utils'
import { defineNuxtModule, installModule, logger } from '@nuxt/kit'
import { defu } from 'defu'
import { resolveI18nLocaleCodes } from '../lib/i18n-locales'
import {
  fugueContentNuxtOptions,
  getDefaultI18nOptions,
  localeCodeFromEntry,
  localeNameFromEntry
} from '../lib/i18n-utils'

const log = logger.withTag('fugue-content-site')

const disabledFugueContentPublic = {
  i18nEnabled: false,
  defaultLocale: 'en',
  filteredLocales: [] as Array<{ code: string, name?: string }>
}

export default defineNuxtModule({
  meta: {
    name: 'fugue-content-i18n'
  },
  async setup(_options, nuxt) {
    const fugueContentOptions = fugueContentNuxtOptions(nuxt.options)
    const i18nOptions = fugueContentOptions.i18n

    if (!i18nOptions || typeof i18nOptions !== 'object' || !Array.isArray(i18nOptions.locales) || !i18nOptions.locales.length) {
      nuxt.options.runtimeConfig.public.cms = {
        ...(nuxt.options.runtimeConfig.public.cms as Record<string, unknown> | undefined),
        ...disabledFugueContentPublic
      }
      return
    }

    const defaultLocale = (i18nOptions.defaultLocale as string | undefined) ?? 'en'
    const filteredCodes = resolveI18nLocaleCodes(
      nuxt.options.rootDir,
      i18nOptions.locales,
      code => log.warn(`Content folder not found: content/${code}/ — skipping locale "${code}"`)
    )

    if (!filteredCodes.length) {
      log.warn('i18n locales configured but no content/{locale}/ folders found — using single pages collection')
      nuxt.options.runtimeConfig.public.cms = {
        ...(nuxt.options.runtimeConfig.public.cms as Record<string, unknown> | undefined),
        ...disabledFugueContentPublic
      }
      return
    }

    const mergedI18n = defu(i18nOptions, getDefaultI18nOptions(defaultLocale)) as FugueContentNuxtI18nOptions
    fugueContentOptions.i18n = mergedI18n

    await installModule('@nuxtjs/i18n', mergedI18n as ModuleOptions)

    const filteredLocales = i18nOptions.locales
      .filter(locale => filteredCodes.includes(localeCodeFromEntry(locale)))
      .map(locale => ({
        code: localeCodeFromEntry(locale),
        name: localeNameFromEntry(locale)
      }))

    nuxt.options.runtimeConfig.public.cms = {
      i18nEnabled: true,
      defaultLocale,
      filteredLocales
    }

    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.prerender = nitroConfig.prerender || {}
      nitroConfig.prerender.routes = nitroConfig.prerender.routes || []
      const routes = filteredCodes.map(code => (code === defaultLocale
        ? '/'
        : `/${code}`))
      nitroConfig.prerender.routes.push(...routes)
    })
  }
})
