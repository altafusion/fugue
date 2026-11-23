import type { FugueContentEditorChromeContext } from './studio-editor-visibility'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  FUGUE_CONTENT_HEADER_ACTIONS_REGISTER_AFTER,
  resolveFugueContentAuthModeFromPublicConfig,
  scheduleFugueContentHeaderActionsRegistration,
  shouldRegisterFugueContentHeaderActions
} from './header-actions-registration'
import {

  resolveFugueContentShowEditorMenu,
  resolveFugueContentShowFooterEdit,
  resolveFugueContentShowHeaderActions
} from './studio-editor-visibility'

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

function readSource(relativePath: string): string {
  return readFileSync(join(packageRoot, relativePath), 'utf8')
}

describe('resolveFugueContentAuthModeFromPublicConfig', () => {
  it('derives peek gate only when fugue-simple-auth is active', () => {
    expect(resolveFugueContentAuthModeFromPublicConfig({
      fugueContent: { authMode: 'peek' },
      fugueSimpleAuth: { envPrefix: 'SITE' },
      studio: { route: '/_studio' }
    })).toMatchObject({
      authMode: 'peek',
      hasPeekGate: true,
      hasStudioAuth: false
    })
  })

  it('derives studio auth for Pilot manifest without fugue layer config', () => {
    expect(resolveFugueContentAuthModeFromPublicConfig({
      fugueContent: { authMode: 'studio' },
      studio: { route: '/_studio' }
    })).toMatchObject({
      authMode: 'studio',
      hasPeekGate: false,
      hasStudioAuth: true
    })
  })
})

describe('shouldRegisterFugueContentHeaderActions', () => {
  it('registers for studio pilots even when peek env config is absent', () => {
    expect(shouldRegisterFugueContentHeaderActions({
      fugueContent: { authMode: 'studio' },
      studio: { route: '/_studio' }
    })).toBe(true)
  })

  it('does not register when studio and auth chrome are both inactive', () => {
    expect(shouldRegisterFugueContentHeaderActions({
      fugueContent: { authMode: 'off' }
    })).toBe(false)
  })
})

describe('scheduleFugueContentHeaderActionsRegistration', () => {
  it('clears header actions before deferred registration', () => {
    const calls: string[] = []

    scheduleFugueContentHeaderActionsRegistration({
      clear: () => calls.push('clear'),
      register: () => calls.push('register'),
      scheduleAfterHydration: registerFn => registerFn()
    })

    expect(calls).toEqual(['clear', 'register'])
  })

  it('does not register until the hydration scheduler runs', () => {
    const calls: string[] = []
    let scheduled: (() => void) | undefined

    scheduleFugueContentHeaderActionsRegistration({
      clear: () => calls.push('clear'),
      register: () => calls.push('register'),
      scheduleAfterHydration: (registerFn) => {
        scheduled = registerFn
      }
    })

    expect(calls).toEqual(['clear'])
    expect(scheduled).toBeTypeOf('function')
    scheduled!()
    expect(calls).toEqual(['clear', 'register'])
  })
})

describe('user-visible header chrome scenarios (regression matrix)', () => {
  function chrome(overrides: Partial<FugueContentEditorChromeContext>): FugueContentEditorChromeContext {
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

  it('my-site local dev — footer Edit visible before /login; header avatar hidden', () => {
    const ctx = chrome({ authMode: 'studio', hasStudioSession: false })
    expect(resolveFugueContentShowFooterEdit(ctx)).toBe(true)
    expect(resolveFugueContentShowEditorMenu(ctx)).toBe(false)
    expect(resolveFugueContentShowHeaderActions(ctx)).toBe(false)
  })

  it('my-site production — avatar menu only after Google session', () => {
    const anonymous = chrome({ authMode: 'studio', hasStudioSession: false })
    expect(resolveFugueContentShowEditorMenu(anonymous)).toBe(false)
    expect(resolveFugueContentShowHeaderActions(anonymous)).toBe(false)

    const signedIn = chrome({ authMode: 'studio', hasStudioSession: true })
    expect(resolveFugueContentShowEditorMenu(signedIn)).toBe(true)
    expect(resolveFugueContentShowHeaderActions(signedIn)).toBe(true)
  })

  it('peek pilot before /login — no editor menu and no empty wrapper (regression)', () => {
    const ctx = chrome({
      authMode: 'peek',
      hasPeekGate: true,
      peekSession: { required: true, authenticated: false }
    })
    expect(resolveFugueContentShowEditorMenu(ctx)).toBe(false)
    expect(resolveFugueContentShowHeaderActions(ctx)).toBe(false)
  })

  it('does not treat studio route alone as visible chrome (old hasStudio wrapper bug)', () => {
    const ctx = chrome({ authMode: 'studio', hasStudioSession: false, isClientReady: true })
    const legacyWouldShowWrapper = ctx.hasStudioRoute
    expect(legacyWouldShowWrapper).toBe(true)
    expect(resolveFugueContentShowHeaderActions(ctx)).toBe(false)
  })

  it('sSR / first paint — no chrome before client ready', () => {
    const ctx = chrome({ authMode: 'studio', hasStudioSession: true, isClientReady: false })
    expect(resolveFugueContentShowHeaderActions(ctx)).toBe(false)
  })
})

describe('plugin and component source contracts', () => {
  it('client plugin registers after hydration, not on app:mounted', () => {
    const source = readSource('app/plugins/studio-header-actions.client.ts')
    expect(source).toContain(FUGUE_CONTENT_HEADER_ACTIONS_REGISTER_AFTER)
    expect(source).not.toContain('app:mounted')
    expect(source).toContain('setShellHeaderRight(null)')
  })

  it('server plugin resets header actions before SSR render', () => {
    const source = readSource('app/plugins/studio-header-actions.server.ts')
    expect(source).toContain('enforce: \'pre\'')
    expect(source).toContain('setShellHeaderRight(null)')
    expect(source).toContain('setShellFooterRight(null)')
  })

  it('footer client plugin registers after hydration', () => {
    const source = readSource('app/plugins/studio-footer-actions.client.ts')
    expect(source).toContain(FUGUE_CONTENT_HEADER_ACTIONS_REGISTER_AFTER)
    expect(source).toContain('setShellFooterRight(FugueContentFooterActions)')
  })

  it('footer server plugin resets footer actions before SSR render', () => {
    const source = readSource('app/plugins/studio-footer-actions.server.ts')
    expect(source).toContain('enforce: \'pre\'')
    expect(source).toContain('setShellFooterRight(null)')
  })

  it('edit content is one shared component with page, fragment, and footer targets', () => {
    const source = readSource('app/components/FugueContentEditContent.vue')
    expect(source).toContain('handleEditEntry')
    expect(source).toContain('editPage')
    expect(source).toContain('editFragment')
    expect(source).toContain('pageStem')
    expect(source).toContain('fragmentSlug')
    expect(source).toContain('requireSession')
    expect(source).toContain('i-lucide-edit-2')
    expect(source).toContain('size="xs"')
  })

  it('header actions component does not use ClientOnly (hydration mismatch regression)', () => {
    const source = readSource('app/components/FugueContentHeaderActions.vue')
    expect(source).not.toMatch(/<ClientOnly[\s>]/)
    expect(source).toContain('resolveFugueContentShowHeaderActions')
    expect(source).toContain('FugueContentEditorMenu')
    expect(source).not.toMatch(/hasPeekGate \|\| hasStudio/)
  })

  it('dev shortcut plugin binds meta_. to openEditor', () => {
    const source = readSource('app/plugins/studio-dev-shortcut.client.ts')
    expect(source).toContain('meta_.')
    expect(source).toContain('openEditor')
    expect(source).not.toContain('meta_e')
  })
})
