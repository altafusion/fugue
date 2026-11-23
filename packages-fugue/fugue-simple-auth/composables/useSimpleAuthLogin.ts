import type { MaybeRefOrGetter } from 'vue'
import type { FugueSimpleAuthConfig } from '../types/config'
import { resolveSimpleAuthRedirect } from '../lib/login'

export interface UseSimpleAuthLoginOptions {
  /** Post-login destination when `?redirect=` is absent. */
  redirectTo?: MaybeRefOrGetter<string | undefined>
  invalidKeyMessage?: string
  onSuccess?: (redirectTo: string) => void | Promise<void>
}

export function useSimpleAuthLogin(options: UseSimpleAuthLoginOptions = {}) {
  const route = useRoute()
  const config = useRuntimeConfig().public.fugueSimpleAuth as FugueSimpleAuthConfig

  const key = ref('')
  const error = ref('')
  const pending = ref(false)

  function resolveRedirect(): string {
    const explicit = options.redirectTo !== undefined
      ? toValue(options.redirectTo)
      : undefined
    const fallback = explicit || '/'
    return resolveSimpleAuthRedirect(route.query.redirect, fallback)
  }

  async function submit() {
    error.value = ''
    pending.value = true

    try {
      await $fetch(`${config.apiPrefix}/login`, {
        method: 'POST',
        body: { key: key.value }
      })

      const target = resolveRedirect()

      if (options.onSuccess)
        await options.onSuccess(target)
      else
        await navigateTo(target)
    } catch {
      error.value = options.invalidKeyMessage ?? 'Invalid access key.'
    } finally {
      pending.value = false
    }
  }

  return {
    key,
    error,
    pending,
    submit,
    config,
    resolveRedirect
  }
}
