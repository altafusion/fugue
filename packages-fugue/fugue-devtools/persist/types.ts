export const DEVTOOLS_PERSIST_VERSION = 1 as const

export type DevToolsPersistVersion = typeof DEVTOOLS_PERSIST_VERSION

export const DEVTOOLS_PANEL_POSITIONS = ['top', 'right', 'bottom', 'left'] as const

export type DevToolsPanelPosition = typeof DEVTOOLS_PANEL_POSITIONS[number]

/** Wide horizontal dock (top or bottom). */
export function isHorizontalDevToolsDock(position: DevToolsPanelPosition): boolean {
  return position === 'top' || position === 'bottom'
}

export function isDevToolsPanelPosition(value: unknown): value is DevToolsPanelPosition {
  return DEVTOOLS_PANEL_POSITIONS.includes(value as DevToolsPanelPosition)
}

/** Drawer chrome — shared across Fugue devtools adapters. */
export interface DevToolsChromeState {
  enabled: boolean
  panelPosition: DevToolsPanelPosition
  innerToggle: boolean
}

export interface DevToolsPersistedV1<TDomain = Record<string, unknown>> {
  v: DevToolsPersistVersion
  chrome: DevToolsChromeState
  domain: TDomain
}

export function createDefaultDevToolsChrome(isDev = false): DevToolsChromeState {
  return {
    enabled: false,
    panelPosition: 'bottom',
    innerToggle: isDev,
  }
}

export function isDevToolsPersistedV1<TDomain>(
  value: unknown,
): value is DevToolsPersistedV1<TDomain> {
  if (value == null || typeof value !== 'object')
    return false
  const record = value as DevToolsPersistedV1<TDomain>
  return record.v === DEVTOOLS_PERSIST_VERSION
    && record.chrome != null
    && typeof record.chrome === 'object'
    && record.domain != null
    && typeof record.domain === 'object'
}
