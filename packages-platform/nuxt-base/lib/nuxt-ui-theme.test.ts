import type { SitePalette } from './nuxt-ui-theme'
import { describe, expect, it } from 'vitest'
import {
  buildNuxtUIConfig,
  mirrorAppUiThemeFromPalette,
  nuxtUIOptionsFromPalette,
  siteConfigThemeFromPalette,
} from './nuxt-ui-theme'

const testPalette = {
  id: 'test',
  theme: 'test',
  nuxtUI: {
    colors: {
      primary: 'blue',
      secondary: 'blue',
      success: 'green',
      info: 'blue',
      warning: 'yellow',
      error: 'red',
      neutral: 'slate',
    },
    notifications: { position: 'top-0 bottom-auto' },
  },
} satisfies SitePalette

describe('buildNuxtUIConfig', () => {
  it('maps flat primary and gray to ui.colors for Nuxt UI 4', () => {
    expect(buildNuxtUIConfig({ primary: 'blue', gray: 'slate' })).toEqual({
      colors: {
        primary: 'blue',
        secondary: 'blue',
        success: 'green',
        info: 'blue',
        warning: 'yellow',
        error: 'red',
        neutral: 'slate',
      },
      notifications: { position: 'top-0 bottom-auto' },
      main: {
        base: 'flex-1 w-full min-h-0',
      },
    })
  })

  it('defaults main base so header+footer shells do not force overflow', () => {
    expect(buildNuxtUIConfig().main).toEqual({
      base: 'flex-1 w-full min-h-0',
    })
  })

  it('nested colors override defaults', () => {
    expect(buildNuxtUIConfig({
      primary: 'blue',
      colors: { primary: 'indigo' },
    }).colors.primary).toBe('indigo')
  })
})

describe('palette helpers', () => {
  it('nuxtUIOptionsFromPalette extracts colors and notifications', () => {
    expect(nuxtUIOptionsFromPalette(testPalette)).toEqual({
      colors: testPalette.nuxtUI.colors,
      notifications: { position: 'top-0 bottom-auto' },
    })
  })

  it('siteConfigThemeFromPalette builds defineFugueContentSite theme section', () => {
    expect(siteConfigThemeFromPalette(testPalette)).toEqual({
      theme: 'test',
      enableNuxtUI: true,
      darkCanvas: 'gray',
      nuxtUIOptions: {
        colors: testPalette.nuxtUI.colors,
        notifications: { position: 'top-0 bottom-auto' },
      },
    })
  })

  it('siteConfigThemeFromPalette forwards palette darkCanvas', () => {
    expect(siteConfigThemeFromPalette({ ...testPalette, darkCanvas: 'black' }).darkCanvas).toBe('black')
  })

  it('mirrorAppUiThemeFromPalette matches buildNuxtUIConfig output', () => {
    expect(mirrorAppUiThemeFromPalette(testPalette)).toEqual(
      buildNuxtUIConfig(nuxtUIOptionsFromPalette(testPalette)),
    )
  })
})
