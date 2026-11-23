export type FugueSimpleAuthMode = 'full' | 'routes'

export interface FugueSimpleAuthConfig {
  /** Env prefix — e.g. MY_SITE → MY_SITE_ACCESS_KEY */
  envPrefix: string
  cookieName: string
  /** HMAC payload label — unique per app */
  sessionLabel: string
  mode: FugueSimpleAuthMode
  loginPath: string
  apiPrefix: string
  protectedRoutes: string[]
  publicExact: string[]
  publicPrefixes: string[]
  publicPaths: string[]
  loginDescription: string
  /** Set at build time — whether SSR auth preset is active */
  authRequired: boolean
}

export const fugueSimpleAuthDefaults: FugueSimpleAuthConfig = {
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
