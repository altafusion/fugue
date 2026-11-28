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

/** Classes a site can add to or override on the dev tools, as Nuxt UI's `ui` prop does: later classes win over the defaults. */
export interface DevToolsPanelUi {
  /** The drawer surface. Default `dark:bg-[#1e1e77]`: a site's own `dark:bg-…` replaces it. */
  panel?: string
  /** The dock's bar (the toggle). Default `dark:bg-[#1e1e77]`. Same slot names as `FloatingDock`'s `ui`. */
  bar?: string
}
