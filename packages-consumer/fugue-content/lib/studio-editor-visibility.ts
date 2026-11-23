import type { ResolvedFugueContentSiteAuthMode } from './auth-resolve'

export interface FugueContentPeekSessionState {
  required?: boolean
  authenticated?: boolean
}

export interface FugueContentEditorChromeContext {
  authMode: ResolvedFugueContentSiteAuthMode
  hasStudioRoute: boolean
  isClientReady: boolean
  isStudioActive: boolean
  hasStudioSession: boolean
  hasPeekGate: boolean
  peekSession: FugueContentPeekSessionState | null | undefined
  peekPending: boolean
  showPeekSignOut: boolean
}

/** Signed-in editor — inline `FugueContentEditContent` on fragments and article pages. */
export function resolveFugueContentShowFragmentEdit(ctx: {
  isAuthenticated: boolean
}): boolean {
  return ctx.isAuthenticated
}

/** Avatar editor menu — only after Studio Google/dev session is established. */
export function resolveFugueContentShowEditorMenu(ctx: FugueContentEditorChromeContext): boolean {
  if (!ctx.isClientReady || !ctx.hasStudioRoute)
    return false

  return ctx.hasStudioSession
}

/** Footer Edit entry — visible when Studio is configured; hidden while the editor is open. */
export function resolveFugueContentShowFooterEdit(ctx: FugueContentEditorChromeContext): boolean {
  if (!ctx.isClientReady || !ctx.hasStudioRoute || ctx.isStudioActive)
    return false

  return true
}

/** Whether the header actions wrapper should mount (avoids empty chrome + hydration drift). */
export function resolveFugueContentShowHeaderActions(ctx: FugueContentEditorChromeContext): boolean {
  if (resolveFugueContentShowEditorMenu(ctx))
    return true

  return Boolean(
    ctx.isClientReady
    && ctx.hasPeekGate
    && ctx.showPeekSignOut
    && !ctx.hasStudioSession
  )
}
