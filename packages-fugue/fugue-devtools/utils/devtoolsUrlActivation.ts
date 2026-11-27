import type { DevToolsPublicConfig, DevToolsUrlActivation } from '#devtools/composables/devtoolsTypes'

export function parseDevToolsUrlActivation(
  searchParams: URLSearchParams,
  config: Pick<DevToolsPublicConfig, 'openParams' | 'innerToggleParams'>,
): DevToolsUrlActivation {
  const queryKeys = new Set(
    Array.from(searchParams.keys(), k => k.toLowerCase()),
  )
  const openParams = config.openParams.map(p => p.toLowerCase())
  const innerParams = config.innerToggleParams.map(p => p.toLowerCase())
  const disabledFromUrl = Array.from(searchParams.entries()).some(
    ([key, value]) => openParams.includes(key.toLowerCase()) && value.toLowerCase() === 'off',
  )
  return {
    enabledFromUrl: !disabledFromUrl && (openParams.some(p => queryKeys.has(p))
      || innerParams.some(p => queryKeys.has(p))),
    disabledFromUrl,
    hasInnerToggleParam: innerParams.some(p => queryKeys.has(p)),
  }
}

function queryRecordToSearchParams(query: Record<string, unknown>): URLSearchParams {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const entry of value)
        params.append(key, String(entry))
    } else if (value != null) {
      params.set(key, String(value))
    } else {
      params.set(key, '')
    }
  }
  return params
}

/** Route query + client `window.location.search` fallback (React parity). */
export function readDevToolsUrlActivation(
  query: Record<string, unknown>,
  config: Pick<DevToolsPublicConfig, 'openParams' | 'innerToggleParams'>,
): DevToolsUrlActivation {
  const fromRoute = parseDevToolsUrlActivation(queryRecordToSearchParams(query), config)
  if (fromRoute.enabledFromUrl || fromRoute.disabledFromUrl)
    return fromRoute

  if (typeof window !== 'undefined') {
    const fromWindow = parseDevToolsUrlActivation(new URLSearchParams(window.location.search), config)
    if (fromWindow.enabledFromUrl || fromWindow.disabledFromUrl)
      return fromWindow
  }

  return fromRoute
}

/** Strip configured open params from a route query (for disable() cleanup). */
export function stripDevToolsOpenParams(
  query: Record<string, unknown>,
  config: Pick<DevToolsPublicConfig, 'openParams' | 'innerToggleParams'>,
): Record<string, unknown> {
  const strip = new Set([
    ...config.openParams.map(p => p.toLowerCase()),
    ...config.innerToggleParams.map(p => p.toLowerCase()),
  ])
  const next = { ...query }
  for (const key of Object.keys(next)) {
    if (strip.has(key.toLowerCase()))
      delete next[key]
  }
  return next
}
