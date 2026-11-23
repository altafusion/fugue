import { isAccessKeyConfigured, readAccessKey } from '#simple-auth/lib/env'
import { getSimpleAuthConfig } from './config'

export function getAccessKey(): string {
  const { envPrefix } = getSimpleAuthConfig()
  return readAccessKey(envPrefix, import.meta.dev)
}

export function isAuthRequired(): boolean {
  const { envPrefix } = getSimpleAuthConfig()
  return isAccessKeyConfigured(envPrefix, import.meta.dev)
}
