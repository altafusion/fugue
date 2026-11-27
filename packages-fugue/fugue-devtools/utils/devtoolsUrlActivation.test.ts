/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest'
import { readDevToolsUrlActivation, stripDevToolsOpenParams } from './devtoolsUrlActivation'

const config = {
  openParams: ['devtools'],
  innerToggleParams: ['devtoolstoggle'],
}

describe('readDevToolsUrlActivation', () => {
  it('is off when no param is present', () => {
    expect(readDevToolsUrlActivation({}, config)).toEqual({ enabledFromUrl: false, disabledFromUrl: false, hasInnerToggleParam: false })
  })

  it('opens on the default ?devtools param, with or without a value', () => {
    expect(readDevToolsUrlActivation({ devtools: '' }, config).enabledFromUrl).toBe(true)
    expect(readDevToolsUrlActivation({ devtools: null }, config).enabledFromUrl).toBe(true)
    expect(readDevToolsUrlActivation({
      devtools: ['1', '2'],
    }, config).enabledFromUrl).toBe(true)
  })

  it('matches param names case-insensitively', () => {
    expect(readDevToolsUrlActivation({ DevTools: '' }, config).enabledFromUrl).toBe(true)
  })

  it('opens on a site-configured param such as ?qetools, and not on the default one', () => {
    const site = {
      openParams: ['qetools'],
      innerToggleParams: ['devtoolstoggle'],
    }
    expect(readDevToolsUrlActivation({ qetools: '' }, site).enabledFromUrl).toBe(true)
    expect(readDevToolsUrlActivation({ devtools: '' }, site).enabledFromUrl).toBe(false)
  })

  it('treats the inner toggle param as both an open and an inner-toggle signal', () => {
    expect(readDevToolsUrlActivation({ devtoolstoggle: '' }, config)).toEqual({
      enabledFromUrl: true,
      disabledFromUrl: false,
      hasInnerToggleParam: true,
    })
  })
})

describe('stripDevToolsOpenParams', () => {
  it('removes open and inner-toggle params and keeps the rest', () => {
    expect(stripDevToolsOpenParams({ devtools: '', DevToolsToggle: '', page: '2' }, config)).toEqual({ page: '2' })
  })

  it('does not mutate the input', () => {
    const query = { devtools: '', page: '2' }
    stripDevToolsOpenParams(query, config)
    expect(query).toEqual({ devtools: '', page: '2' })
  })
})
