import { describe, expect, it } from 'vitest'
import { localeSwitchPathBase, localeSwitchPathWithHash } from './locale-switch-path'

describe('localeSwitchPathBase', () => {
  it('strips hash from switchLocalePath result', () => {
    expect(localeSwitchPathBase('/es#location')).toBe('/es')
  })

  it('strips studio scan hash', () => {
    expect(localeSwitchPathBase('/es#_studio_scan')).toBe('/es')
  })

  it('keeps path-only targets', () => {
    expect(localeSwitchPathBase('/es')).toBe('/es')
    expect(localeSwitchPathBase('/')).toBe('/')
  })
})

describe('localeSwitchPathWithHash', () => {
  it('appends hash after hydration', () => {
    expect(localeSwitchPathWithHash('/es', '#location')).toBe('/es#location')
  })

  it('ignores studio scan hash', () => {
    expect(localeSwitchPathWithHash('/es', '#_studio_scan')).toBe('/es')
  })
})
