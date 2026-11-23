import { describe, expect, it } from 'vitest'
import { fugueSimpleAuthDefaults } from '../types/config'
import { isPathPublic, shouldGatePath } from './path-gate'

const fullConfig = {
  ...fugueSimpleAuthDefaults,
  mode: 'full' as const,
  loginPath: '/login',
  apiPrefix: '/api/auth'
}

const routesConfig = {
  ...fugueSimpleAuthDefaults,
  mode: 'routes' as const,
  loginPath: '/login',
  apiPrefix: '/api/auth',
  protectedRoutes: ['/team/**']
}

describe('full mode', () => {
  it('allows login and auth api', () => {
    expect(isPathPublic('/login', fullConfig)).toBe(true)
    expect(isPathPublic('/api/auth/session', fullConfig)).toBe(true)
  })

  it('allows nuxt assets', () => {
    expect(isPathPublic('/_nuxt/entry.js', fullConfig)).toBe(true)
  })

  it('gates content routes', () => {
    expect(shouldGatePath('/introduction', fullConfig)).toBe(true)
    expect(shouldGatePath('/', fullConfig)).toBe(true)
  })
})

describe('routes mode', () => {
  it('allows public landing', () => {
    expect(isPathPublic('/', routesConfig)).toBe(true)
  })

  it('gates protected routes only', () => {
    expect(shouldGatePath('/team', routesConfig)).toBe(true)
    expect(shouldGatePath('/team/roster', routesConfig)).toBe(true)
    expect(shouldGatePath('/about', routesConfig)).toBe(false)
  })
})
