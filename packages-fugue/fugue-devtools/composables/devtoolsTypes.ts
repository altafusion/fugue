import type { DevToolsChromeState, DevToolsPanelPosition } from '@altafusion/fugue-devtools-persist'
import type { ComputedRef, InjectionKey, Ref } from 'vue'

export type { DevToolsChromeState, DevToolsPanelPosition }
export {
  createDefaultDevToolsChrome,
  DEVTOOLS_PANEL_POSITIONS,
  isHorizontalDevToolsDock,
} from '@altafusion/fugue-devtools-persist'

export interface DevToolsUrlActivation {
  enabledFromUrl: boolean
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

export interface DevToolsApi {
  chrome: Ref<DevToolsChromeState>
  showPanel: ComputedRef<boolean>
  updateChrome: <K extends keyof DevToolsChromeState>(_key: K, _value: DevToolsChromeState[K]) => void
  disable: () => void
  enable: () => void
}

export const DEVTOOLS_INJECTION_KEY: InjectionKey<DevToolsApi> = Symbol('fugue-devtools')
