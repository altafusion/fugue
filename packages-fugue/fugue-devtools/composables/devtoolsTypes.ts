import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { DevToolsChromeState, DevToolsPanelPosition } from '#devtools/persist'
import type { DevToolsRegistry } from './devtoolsRegistry'

export type { DevToolsChromeState, DevToolsPanelPosition }
export {
  createDefaultDevToolsChrome,
  DEVTOOLS_PANEL_POSITIONS,
  isHorizontalDevToolsDock,
} from '#devtools/persist'

export interface DevToolsUrlActivation {
  enabledFromUrl: boolean
  /** An open param carries the value `off`: turn the devtools off. */
  disabledFromUrl: boolean
  hasInnerToggleParam: boolean
}

export interface DevToolsPublicConfig {
  openParams: string[]
  innerToggleParams: string[]
}

export interface DevToolsPersistConfig {
  namespace: string
  key: string
}

export interface DevToolsApi extends DevToolsRegistry {
  chrome: Ref<DevToolsChromeState>
  showPanel: ComputedRef<boolean>
  updateChrome: <K extends keyof DevToolsChromeState>(_key: K, _value: DevToolsChromeState[K]) => void
  disable: () => void
  enable: () => void
}

export const DEVTOOLS_INJECTION_KEY: InjectionKey<DevToolsApi> = Symbol('fugue-devtools')
