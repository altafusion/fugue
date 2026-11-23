import { describe, expect, it } from 'vitest'
import {
  landingNavItems,
  landingSectionClass,
  landingSectionClasses,
  landingSectionComponentName,
  landingSectionNavPath,
  landingSectionProps
} from './landing'

describe('landingSectionNavPath', () => {
  it('uses explicit nav.to when set', () => {
    expect(landingSectionNavPath({
      slug: 'x',
      anchor: 'x',
      nav: { to: '/custom', icon: 'i-lucide-x' }
    })).toBe('/custom')
  })

  it('maps home anchor to /', () => {
    expect(landingSectionNavPath({ slug: 'hero', anchor: 'home' })).toBe('/')
  })

  it('maps other anchors to hash paths', () => {
    expect(landingSectionNavPath({ slug: 'activities', anchor: 'activities' })).toBe('/#activities')
  })
})

describe('landingNavItems', () => {
  const sections = [
    {
      slug: 'hero',
      anchor: 'home',
      nav: {
        labelKey: 'nav.home',
        label: 'Home',
        icon: 'i-lucide-home',
        id: 'home'
      }
    },
    {
      slug: 'activities',
      anchor: 'activities',
      nav: {
        labelKey: 'nav.activities',
        label: 'Activities',
        icon: 'i-lucide-palette',
        id: 'activities'
      }
    },
    { slug: 'location', anchor: 'location' }
  ] as const

  it('includes only sections with nav', () => {
    expect(landingNavItems([...sections])).toHaveLength(2)
  })

  it('applies localePath to nav targets', () => {
    const items = landingNavItems([...sections], path => `/es${path === '/'
      ? ''
      : path}`)
    expect(items[0]?.to).toBe('/es')
    expect(items[1]?.to).toBe('/es/#activities')
  })
})

describe('landingSectionProps', () => {
  it('passes slug to FugueContentFragment by default', () => {
    expect(landingSectionProps({ slug: 'hero', anchor: 'home' })).toEqual({ slug: 'hero' })
  })

  it('merges custom props without slug for other components', () => {
    expect(landingSectionProps({
      slug: 'map',
      anchor: 'location',
      component: {
        name: 'LocationMap',
        props: { compact: true }
      }
    })).toEqual({ compact: true })
  })

  it('defaults slug for LandingHeroMedia when contentComponent is omitted', () => {
    expect(landingSectionProps({
      slug: 'hero',
      anchor: 'home',
      component: {
        name: 'LandingHeroMedia',
        props: { src: '/hero.jpg', alt: 'Hero' }
      }
    })).toEqual({ src: '/hero.jpg', alt: 'Hero', slug: 'hero' })
  })

  it('defaults slug for custom fragment shells when contentComponent is omitted', () => {
    expect(landingSectionProps({
      slug: 'activities',
      anchor: 'activities',
      component: 'ActivitiesFragment'
    })).toEqual({ slug: 'activities' })
  })

  it('does not inject slug for LandingHeroMedia when contentComponent is set', () => {
    expect(landingSectionProps({
      slug: 'hero',
      anchor: 'home',
      component: {
        name: 'LandingHeroMedia',
        props: {
          src: '/hero.jpg',
          alt: 'Hero',
          contentComponent: 'MyHero'
        }
      }
    })).toEqual({
      src: '/hero.jpg',
      alt: 'Hero',
      contentComponent: 'MyHero'
    })
  })
})

describe('landingSectionComponentName', () => {
  it('defaults to FugueContentFragment', () => {
    expect(landingSectionComponentName({ slug: 'hero', anchor: 'home' })).toBe('FugueContentFragment')
  })

  it('reads name from nested component object', () => {
    expect(landingSectionComponentName({
      slug: 'hero',
      anchor: 'home',
      component: {
        name: 'LandingHeroMedia',
        props: { src: '/hero.jpg', alt: 'Hero' }
      }
    })).toBe('LandingHeroMedia')
  })
})

describe('landingSectionClass', () => {
  it('uses manifest sectionClass when set', () => {
    expect(landingSectionClass(
      { slug: 'hero', anchor: 'home', sectionClass: 'landing-hero' },
      'landing-section'
    )).toBe('landing-hero')
  })

  it('falls back to page default', () => {
    expect(landingSectionClass({ slug: 'hero', anchor: 'home' }, 'landing-section')).toBe('landing-section')
  })
})

describe('landingSectionClasses', () => {
  it('appends variant modifier to manifest base class', () => {
    expect(landingSectionClasses(
      {
        slug: 'hero',
        anchor: 'home',
        sectionClass: 'landing-hero',
        variant: 'full'
      },
      'landing-section'
    )).toEqual(['landing-hero', 'landing-hero--full'])
  })

  it('uses page default and variant when manifest omits sectionClass', () => {
    expect(landingSectionClasses(
      { slug: 'activities', anchor: 'activities', variant: 'alt' },
      'landing-section'
    )).toEqual(['landing-section', 'landing-section--alt'])
  })
})
