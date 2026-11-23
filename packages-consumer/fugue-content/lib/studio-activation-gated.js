/* global $fetch -- Nuxt/Nitro runtime global */
import { getAppManifest, useCookie, useRuntimeConfig, useState } from '#imports'
import {
  FUGUE_CONTENT_STUDIO_COOKIE_OPTIONS,
  FUGUE_CONTENT_STUDIO_DEV_AUTH_CHECK,
  FUGUE_CONTENT_STUDIO_SESSION_CHECK,
  FUGUE_CONTENT_STUDIO_SESSION_ROUTE
} from './studio-cookies.js'

/** Deferred dev activation when fugue-simple-auth session is missing. */
let deferredActivate = null

/** Called from Edit Content / studio-mount after the access-key session is valid. */
export async function ensureStudioActivation() {
  if (import.meta.server)
    return false

  if (typeof window.useStudioHost === 'function')
    return true

  if (!deferredActivate)
    return false

  await deferredActivate()
  return typeof window.useStudioHost === 'function'
}

const devUser = {
  provider: 'github',
  email: 'dev@nuxt.com',
  name: 'Dev',
  accessToken: '',
  providerId: '',
  avatar: ''
}

function registerLoginShortcut(loginPath) {
  document.addEventListener('keydown', (event) => {
    if (event.metaKey && event.key === '.') {
      event.preventDefault()
      const redirect = encodeURIComponent(window.location.pathname + window.location.search)
      window.location.href = `${loginPath}?redirect=${redirect}`
    }
  })
}

export async function defineStudioActivationPlugin(onStudioActivation) {
  const user = useState('studio-session', () => null)
  const config = useRuntimeConfig().public.studio
  const sessionCheck = useCookie(FUGUE_CONTENT_STUDIO_SESSION_CHECK, FUGUE_CONTENT_STUDIO_COOKIE_OPTIONS)
  const devAuthCheck = useCookie(FUGUE_CONTENT_STUDIO_DEV_AUTH_CHECK, FUGUE_CONTENT_STUDIO_COOKIE_OPTIONS)

  async function activateDev() {
    await onStudioActivation(devUser)
  }

  if (config.dev) {
    deferredActivate = activateDev

    if (String(devAuthCheck.value) === 'true') {
      await activateDev()
      return
    }

    const fugue = useRuntimeConfig().public.fugueSimpleAuth
    if (fugue?.mode === 'routes') {
      try {
        const session = await $fetch(`${fugue.apiPrefix}/session`)
        if (session?.required && !session?.authenticated) {
          registerLoginShortcut(fugue.loginPath ?? '/login')
          return
        }
      } catch {
        registerLoginShortcut(fugue.loginPath ?? '/login')
        return
      }
    }

    return
  }

  async function resolveProductionUser() {
    if (user.value?.email)
      return user.value

    if (String(sessionCheck.value) !== 'true')
      return null

    const sessionUser = await $fetch(FUGUE_CONTENT_STUDIO_SESSION_ROUTE).then(session => session?.user ?? null)
    if (sessionUser?.email)
      user.value = sessionUser

    return sessionUser
  }

  async function activateProduction() {
    const sessionUser = await resolveProductionUser()
    if (!sessionUser?.email)
      return false

    const manifest = await getAppManifest()
    manifest.prerendered = []
    await onStudioActivation(sessionUser)
    return typeof window.useStudioHost === 'function'
  }

  deferredActivate = activateProduction

  user.value = String(sessionCheck.value) === 'true'
    ? await $fetch(FUGUE_CONTENT_STUDIO_SESSION_ROUTE).then(session => session?.user ?? null)
    : null

  let mounted = false
  if (user.value?.email) {
    mounted = await activateProduction()
  } else if (mounted) {
    window.location.reload()
  } else {
    document.addEventListener('keydown', (event) => {
      if (event.metaKey && event.key === '.') {
        setTimeout(() => {
          window.location.href = `${config.route}?redirect=${encodeURIComponent(window.location.pathname)}`
        })
      }
    })
  }
}
