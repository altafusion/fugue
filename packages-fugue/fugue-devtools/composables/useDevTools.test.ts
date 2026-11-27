/**
 * @vitest-environment happy-dom
 */
import type { Router } from 'vue-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, reactive } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createDevToolsApi } from './useDevTools'

const urlConfig = {
  openParams: ['devtools'],
  innerToggleParams: ['devtoolstoggle'],
}
const persist = { namespace: 'app', key: 'devtools' }

function setup(query: Record<string, unknown> = {}, options: { isDev?: boolean, withPersist?: boolean } = {}) {
  const route = reactive({
    query,
    path: '/page',
    hash: '',
    fullPath: '/page',
  })
  const router = {
    replace: vi.fn(),
  } as unknown as Router
  vi.stubGlobal('useRoute', () => route)
  const api = createDevToolsApi({
    router,
    isDev: options.isDev ?? false,
    urlConfig,
    persist: options.withPersist === false
      ? undefined
      : persist,
  })
  return { api, route, router }
}

describe('createDevToolsApi', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('stays closed without the activation param', () => {
    const { api } = setup()
    expect(api.showPanel.value).toBe(false)
    expect(api.chrome.value.enabled).toBe(false)
  })

  it('opens when the activation param is in the route query', () => {
    const { api } = setup({ devtools: '' })
    expect(api.showPanel.value).toBe(true)
    expect(api.chrome.value.enabled).toBe(true)
  })

  it('opens when the param is only in window.location.search', () => {
    window.history.replaceState({}, '', '/?devtools')
    const { api } = setup()
    expect(api.showPanel.value).toBe(true)
  })

  it('opens when the param is added by a later navigation', async () => {
    const { api, route } = setup()
    route.query = { devtools: '' }
    route.fullPath = '/page?devtools'
    await nextTick()
    expect(api.chrome.value.enabled).toBe(true)
  })

  it('persists dock position changes and restores them in a new instance', async () => {
    const first = setup({}, { isDev: false }).api
    first.updateChrome('panelPosition', 'left')
    first.enable()
    await nextTick()
    expect(JSON.parse(localStorage.getItem('app::devtools')!).chrome).toMatchObject({
      enabled: true,
      panelPosition: 'left',
    })

    const second = setup().api
    expect(second.chrome.value.panelPosition).toBe('left')
    expect(second.chrome.value.enabled).toBe(true)
    expect(second.showPanel.value).toBe(true)
  })

  it('keeps the persisted domain when chrome changes', async () => {
    localStorage.setItem('app::devtools', JSON.stringify({
      v: 1,
      chrome: { enabled: false, panelPosition: 'bottom', innerToggle: false },
      domain: { flag: 'kept' },
    }))
    const { api } = setup()
    api.updateChrome('panelPosition', 'right')
    await nextTick()
    expect(JSON.parse(localStorage.getItem('app::devtools')!).domain).toEqual({ flag: 'kept' })
  })

  it('writes nothing when persist is not configured', async () => {
    const { api } = setup({}, { withPersist: false })
    api.enable()
    await nextTick()
    expect(localStorage.length).toBe(0)
  })

  it('disable() closes the panel and strips the activation param from the URL', () => {
    const { api, router } = setup({ devtools: '', page: '2' })
    api.disable()
    expect(api.chrome.value.enabled).toBe(false)
    expect(router.replace).toHaveBeenCalledWith({
      path: '/page',
      query: { page: '2' },
      hash: '',
    })
  })

  it('disable() does not touch the URL when the panel was not opened by it', () => {
    const { api, router } = setup()
    api.enable()
    api.disable()
    expect(router.replace).not.toHaveBeenCalled()
  })

  it('opens the drawer, not only enables it, when activated by the URL', () => {
    const { api } = setup({ devtools: '' })
    expect(api.chrome.value.open).toBe(true)
  })

  it('closing keeps the devtools enabled', () => {
    const { api } = setup({ devtools: '' })
    api.updateChrome('open', false)
    expect(api.chrome.value.enabled).toBe(true)
    expect(api.showPanel.value).toBe(true)
  })

  it('turns off when the param value is "off" and strips it', () => {
    const { api, router } = setup({ devtools: 'off', page: '2' })
    expect(api.showPanel.value).toBe(false)
    expect(api.chrome.value.enabled).toBe(false)
    expect(router.replace).toHaveBeenCalledWith({ path: '/page', query: { page: '2' }, hash: '' })
  })

  it('disable() resets the persisted chrome', async () => {
    const { api } = setup({}, { isDev: false })
    api.updateChrome('panelPosition', 'left')
    api.enable()
    api.disable()
    await nextTick()
    expect(JSON.parse(localStorage.getItem('app::devtools')!).chrome).toMatchObject({
      enabled: false,
      open: false,
      panelPosition: 'bottom',
    })
  })

  it('turn off, then re-enable by URL, with a router that really updates the URL', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }],
    })
    await router.push('/page?devtools')
    vi.stubGlobal('useRoute', () => new Proxy({}, {
      get: (_, key) => (router.currentRoute.value as unknown as Record<string | symbol, unknown>)[key],
    }))
    const api = createDevToolsApi({ router, isDev: false, urlConfig, persist })
    expect(api.showPanel.value).toBe(true)

    api.disable()
    await vi.waitFor(() => expect(router.currentRoute.value.fullPath).toBe('/page'))
    await nextTick()
    expect(api.showPanel.value).toBe(false)

    await router.push('/page?devtools')
    await nextTick()
    expect(api.showPanel.value).toBe(true)
    expect(api.chrome.value.open).toBe(true)
  })

  it('exposes the section registry on the api', () => {
    const { api } = setup({}, { isDev: true })
    api.registerSection({ id: 'a', label: 'A', component: { render: () => null } })
    expect(api.visibleSections.value.map(s => s.id)).toEqual(['a'])
  })
})
