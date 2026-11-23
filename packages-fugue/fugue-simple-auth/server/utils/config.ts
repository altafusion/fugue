import type { FugueSimpleAuthConfig } from '../../types/config'

export function getSimpleAuthConfig(): FugueSimpleAuthConfig {
  return useRuntimeConfig().public.fugueSimpleAuth as FugueSimpleAuthConfig
}
