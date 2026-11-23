/** Env bag for MSW enablement — map from Vite `import.meta.env` or Nuxt `runtimeConfig.public`. */
export interface AltafusionMswEnv {
  mswEnabled?: boolean | string
  /** When true, use real backend (MSW stays off even if mswEnabled is set). */
  serverEnabled?: boolean | string
}

export function isMswEnabled(env: AltafusionMswEnv): boolean {
  const on = env.mswEnabled === true || env.mswEnabled === 'true'
  const server = env.serverEnabled === true || env.serverEnabled === 'true'
  return on && !server
}
