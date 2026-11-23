import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

export function accessKeyEnvName(envPrefix: string): string {
  return [envPrefix, 'ACCESS', 'KEY'].join('_')
}

export function authEnabledEnvName(envPrefix: string): string {
  return [envPrefix, 'AUTH', 'ENABLED'].join('_')
}

export function parseEnvValue(raw: string): string {
  const value = raw.trim()
  const quoted = (value.startsWith('"') && value.endsWith('"'))
    || (value.startsWith('\'') && value.endsWith('\''))
  return quoted
    ? value.slice(1, -1)
    : value
}

export function readEnvFileValue(name: string): string | undefined {
  try {
    const envPath = join(process.cwd(), '.env')
    const line = readFileSync(envPath, 'utf8')
      .split('\n')
      .find(entry => entry.startsWith(`${name}=`))

    if (!line)
      return undefined

    return parseEnvValue(line.slice(name.length + 1))
  } catch {
    return undefined
  }
}

/** Build-time only — checks presence, never serializes the secret. */
export function isAuthEnabledAtBuild(envPrefix: string): boolean {
  const enabledName = authEnabledEnvName(envPrefix)
  const enabled = process.env[enabledName] ?? readEnvFileValue(enabledName)
  if (enabled === 'true')
    return true

  const keyName = accessKeyEnvName(envPrefix)
  const key = process.env[keyName] ?? readEnvFileValue(keyName)
  return typeof key === 'string' && key.length > 0
}

/** Runtime access key — dynamic env name avoids Nitro inlining (Netlify secret scan). */
export function readAccessKey(envPrefix: string, devReloadFromDotEnv = false): string {
  const name = accessKeyEnvName(envPrefix)
  const fromFile = devReloadFromDotEnv
    ? readEnvFileValue(name)
    : undefined
  return fromFile ?? process.env[name] ?? ''
}

export function isAccessKeyConfigured(envPrefix: string, devReloadFromDotEnv = false): boolean {
  return Boolean(readAccessKey(envPrefix, devReloadFromDotEnv))
}
