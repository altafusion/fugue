/**
 * @altafusion/fugue-simple-auth — Nuxt layer
 *
 * Optional access-key gate with signed session cookie and Netlify SSR hooks.
 * Requires a parent layer or app to register @nuxt/ui (Docus, shell, or fugue-theme).
 */

/// <reference path="./types/nuxt-fugue-simple-auth.d.ts" />

import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  modules: [
    fileURLToPath(new URL('./modules/simple-auth', import.meta.url))
  ],

  components: [
    {
      path: './components',
      pathPrefix: false
    }
  ],

  runtimeConfig: {
    public: {
      fugueSimpleAuth: {
        envPrefix: 'APP',
        cookieName: 'fugue-simple-auth',
        sessionLabel: 'fugue-simple-authenticated',
        mode: 'full',
        loginPath: '/login',
        apiPrefix: '/api/auth',
        protectedRoutes: [],
        publicExact: ['/favicon.ico', '/favicon.svg'],
        publicPrefixes: ['/_nuxt/', '/__nuxt/'],
        publicPaths: [],
        loginDescription: 'Enter the access key to continue.',
        authRequired: false
      }
    }
  }
})
