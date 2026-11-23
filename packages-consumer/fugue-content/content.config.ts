import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { logger, useNuxt } from '@nuxt/kit'
import { joinURL } from 'ufo'
import { resolveI18nLocaleCodes } from './lib/i18n-locales'
import {
  contentPrefixForLocale,
  fragmentsCollectionName,
  fragmentsRoutePrefix,
  fugueContentNuxtOptions,
  pagesCollectionName,
  settingsCollectionName
} from './lib/i18n-utils'

const log = logger.withTag('fugue-content-site')

const options = fugueContentNuxtOptions(useNuxt().options)
const cwd = joinURL(options.rootDir, 'content')

const pageSchema = z.object({
  layout: z.enum(['landing', 'article', 'article-aside']).default('landing'),
  nav: z.object({
    primary: z.string().optional()
  }).optional()
})

const fragmentImageSchema = z.object({
  src: z.string(),
  alt: z.string(),
  span: z.number().optional()
})

const fragmentSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  /** Optional gallery for section shells such as ActivitiesFragment */
  images: z.array(fragmentImageSchema).optional()
})

const landingSectionNavSchema = z.object({
  labelKey: z.string().optional(),
  label: z.string().optional(),
  icon: z.string().optional(),
  id: z.string().optional(),
  to: z.string().optional()
}).optional()

const landingSectionComponentSchema = z.union([
  z.string(),
  z.object({
    name: z.string(),
    props: z.record(z.string(), z.unknown()).optional()
  })
])

const landingSectionSchema = z.object({
  slug: z.string(),
  anchor: z.string(),
  component: landingSectionComponentSchema.default('FugueContentFragment'),
  sectionClass: z.string().optional(),
  variant: z.string().optional(),
  nav: landingSectionNavSchema
})

const landingSchema = z.object({
  sections: z.array(landingSectionSchema).default([])
}).optional()

const themeSchema = z.object({
  darkCanvas: z.enum(['gray', 'black']).optional()
}).optional()

const settingsSchema = z.object({
  siteName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    region: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional()
  }).optional(),
  hours: z.string().optional(),
  mapEmbedUrl: z.string().optional(),
  social: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional()
  }).optional(),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    titleTemplate: z.string().optional(),
    ogImage: z.string().optional(),
    twitterCard: z.enum(['summary', 'summary_large_image']).optional()
  }).optional(),
  landing: landingSchema,
  theme: themeSchema
})

const i18nOptions = options.i18n
const hasI18nLocales = i18nOptions
  && typeof i18nOptions === 'object'
  && Array.isArray(i18nOptions.locales)
  && i18nOptions.locales.length > 0

const defaultLocale = hasI18nLocales
  ? ((i18nOptions.defaultLocale as string | undefined) ?? 'en')
  : 'en'

const localeCodes = hasI18nLocales && i18nOptions.locales
  ? resolveI18nLocaleCodes(
      options.rootDir,
      i18nOptions.locales,
      code => log.warn(`Content folder not found: content/${code}/ — skipping locale "${code}" in collections`)
    )
  : []

function pagesCollectionForLocale(code?: string) {
  const localeSegment = code
    ? `${code}/`
    : ''
  const prefix = code
    ? contentPrefixForLocale(code, defaultLocale)
    : '/'

  return defineCollection({
    type: 'page',
    source: {
      cwd,
      include: `${localeSegment}**/*.md`,
      exclude: code
        ? [`${code}/fragments/**`, '**/.*']
        : ['fragments/**', '**/.*'],
      prefix
    },
    schema: pageSchema
  })
}

function fragmentsCollectionForLocale(code?: string) {
  const localeSegment = code
    ? `${code}/`
    : ''
  const routePrefix = code
    ? fragmentsRoutePrefix(code, defaultLocale)
    : '/fragments'

  return defineCollection({
    type: 'page',
    source: {
      cwd,
      include: `${localeSegment}fragments/**/*.md`,
      exclude: ['**/.*'],
      prefix: routePrefix
    },
    schema: fragmentSchema
  })
}

function settingsCollectionForLocale(code?: string) {
  const localeSegment = code
    ? `${code}/`
    : ''

  return defineCollection({
    type: 'data',
    source: {
      cwd,
      include: `${localeSegment}settings/**/*.yml`,
      exclude: ['**/.*']
    },
    schema: settingsSchema
  })
}

const collections = localeCodes.length > 0
  ? Object.fromEntries(
      localeCodes.flatMap(code => [
        [
          pagesCollectionName(code),
          pagesCollectionForLocale(code)
        ],
        [
          fragmentsCollectionName(code),
          fragmentsCollectionForLocale(code)
        ],
        [
          settingsCollectionName(code),
          settingsCollectionForLocale(code)
        ]
      ])
    )
  : {
      pages: pagesCollectionForLocale(),
      fragments: fragmentsCollectionForLocale(),
      settings: settingsCollectionForLocale()
    }

export default defineContentConfig({ collections })
