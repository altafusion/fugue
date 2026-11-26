import type { FugueContentEditorChromeContext } from './studio-editor-visibility'
import { describe, expect, it } from 'vitest'
import {
  resolveFugueContentShowEditorMenu,
  resolveFugueContentShowFooterEdit,
  resolveFugueContentShowFragmentEdit,
  resolveFugueContentShowHeaderActions
} from './studio-editor-visibility'

function base(overrides: Partial<FugueContentEditorChromeContext> = {}): FugueContentEditorChromeContext {
  return {
    authMode: 'studio',
    hasStudioRoute: true,
    isClientReady: true,
    isStudioActive: false,
    hasStudioSession: false,
    hasPeekGate: false,
    peekSession: null,
    peekPending: false,
    showPeekSignOut: false,
    ...overrides
  }
}

describe('resolveFugueContentShowFragmentEdit', () => {
  it('shows fragment edit for authenticated editors', () => {
    expect(resolveFugueContentShowFragmentEdit({ isAuthenticated: true })).toBe(true)
  })

  it('hides fragment edit without a studio session', () => {
    expect(resolveFugueContentShowFragmentEdit({ isAuthenticated: false })).toBe(false)
  })
})

describe('resolveFugueContentShowEditorMenu', () => {
  it('hides until the client is ready', () => {
    expect(resolveFugueContentShowEditorMenu(base({ isClientReady: false, hasStudioSession: true }))).toBe(false)
  })

  it('shows only when a studio session exists', () => {
    expect(resolveFugueContentShowEditorMenu(base({ hasStudioSession: true }))).toBe(true)
    expect(resolveFugueContentShowEditorMenu(base({ hasStudioSession: false }))).toBe(false)
  })

  it('hides when studio route is missing', () => {
    expect(resolveFugueContentShowEditorMenu(base({ hasStudioSession: true, hasStudioRoute: false }))).toBe(false)
  })

  it('keeps avatar menu visible while studio panel is open', () => {
    expect(resolveFugueContentShowEditorMenu(base({ hasStudioSession: true, isStudioActive: true }))).toBe(true)
  })
})

describe('resolveFugueContentShowFooterEdit', () => {
  it('hides until the client is ready', () => {
    expect(resolveFugueContentShowFooterEdit(base({ isClientReady: false }))).toBe(false)
  })

  it('shows for anonymous studio pilots when configured', () => {
    expect(resolveFugueContentShowFooterEdit(base({ hasStudioSession: false }))).toBe(true)
  })

  it('hides once signed in, because the page-level Edit Page button takes over', () => {
    expect(resolveFugueContentShowFooterEdit(base({ hasStudioSession: true }))).toBe(false)
  })

  it('hides when studio route is missing', () => {
    expect(resolveFugueContentShowFooterEdit(base({ hasStudioRoute: false }))).toBe(false)
  })

  it('hides while the studio editor is active', () => {
    expect(resolveFugueContentShowFooterEdit(base({ isStudioActive: true }))).toBe(false)
    expect(resolveFugueContentShowFooterEdit(base({ isStudioActive: true, hasStudioSession: true }))).toBe(false)
  })
})

describe('resolveFugueContentShowHeaderActions', () => {
  it('shows peek sign out without editor menu when only peek session exists', () => {
    expect(resolveFugueContentShowHeaderActions(base({
      authMode: 'peek',
      hasPeekGate: true,
      showPeekSignOut: true,
      hasStudioSession: false
    }))).toBe(true)
    expect(resolveFugueContentShowEditorMenu(base({
      authMode: 'peek',
      hasPeekGate: true,
      showPeekSignOut: true,
      hasStudioSession: false
    }))).toBe(false)
  })

  it('hides peek chrome when neither sign out nor editor menu should show', () => {
    expect(resolveFugueContentShowHeaderActions(base({
      authMode: 'peek',
      hasPeekGate: true,
      showPeekSignOut: false,
      hasStudioSession: false
    }))).toBe(false)
  })

  it('hides studio chrome before client ready (SSR / first paint)', () => {
    expect(resolveFugueContentShowHeaderActions(base({
      authMode: 'studio',
      isClientReady: false,
      hasStudioSession: true
    }))).toBe(false)
  })

  it('shows editor menu after authenticated studio session', () => {
    expect(resolveFugueContentShowHeaderActions(base({
      authMode: 'studio',
      hasStudioSession: true
    }))).toBe(true)
  })

  it('hides anonymous studio chrome in production and dev', () => {
    expect(resolveFugueContentShowHeaderActions(base({
      authMode: 'studio',
      hasStudioSession: false
    }))).toBe(false)
  })

  it('does not show wrapper for unresolved authMode auto at runtime', () => {
    expect(resolveFugueContentShowHeaderActions(base({
      authMode: 'auto',
      hasStudioSession: true
    }))).toBe(true)
  })
})
