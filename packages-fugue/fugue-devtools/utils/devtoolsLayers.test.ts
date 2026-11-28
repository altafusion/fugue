/**
 * @vitest-environment node
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { DEVTOOLS_LAYER_CLASSES, DEVTOOLS_LAYER_VARS, devToolsLayerValue } from './devtoolsLayers'

const css = readFileSync(fileURLToPath(new URL('../assets/css/devtools-panel.css', import.meta.url)), 'utf8')

function layerNumber(layer: keyof typeof DEVTOOLS_LAYER_VARS) {
  const match = new RegExp(`${DEVTOOLS_LAYER_VARS[layer]}:\\s*(\\d+);`).exec(css)
  expect(match, `${DEVTOOLS_LAYER_VARS[layer]} is declared in devtools-panel.css`).not.toBeNull()
  return Number(match![1])
}

describe('devtools layers', () => {
  it('reads a layer as a CSS variable reference', () => {
    expect(devToolsLayerValue('dock')).toBe('var(--devtools-z-dock)')
    expect(devToolsLayerValue('drawer')).toBe('var(--devtools-z-drawer)')
    expect(devToolsLayerValue('menu')).toBe('var(--devtools-z-menu)')
  })

  it('stacks dock < drawer < menus, all above Nuxt UI overlays (50)', () => {
    const dock = layerNumber('dock')
    const drawer = layerNumber('drawer')
    const menu = layerNumber('menu')
    expect(dock).toBeGreaterThan(50)
    expect(drawer).toBeGreaterThan(dock)
    expect(menu).toBeGreaterThan(drawer)
  })

  it('has a class for each layer that applies its variable', () => {
    for (const layer of Object.keys(DEVTOOLS_LAYER_VARS) as (keyof typeof DEVTOOLS_LAYER_VARS)[]) {
      const rule = new RegExp(`\\.${DEVTOOLS_LAYER_CLASSES[layer]}\\s*\\{[^}]*z-index:\\s*var\\(${DEVTOOLS_LAYER_VARS[layer]}\\)`)
      expect(css).toMatch(rule)
    }
  })

  it('defaults the drawer and the dock to a solid dark colour, not the theme\'s muted token', () => {
    const panel = readFileSync(fileURLToPath(new URL('../components/DevTools/Panel.client.vue', import.meta.url)), 'utf8')
    expect(panel).toMatch(/DEFAULT_PANEL_CLASS = 'dark:bg-\[#1e1e77\]'/)
    expect(panel).toMatch(/DEFAULT_BAR_CLASS = 'dark:bg-\[#1e1e77\]'/)
  })

  it('leaves no hard-coded z-index in the components', () => {
    for (const file of ['Panel.client.vue', 'Nav.vue', 'ToggleButton.vue']) {
      const source = readFileSync(fileURLToPath(new URL(`../components/DevTools/${file}`, import.meta.url)), 'utf8')
      expect(source, file).not.toMatch(/\bz-(\[\d+\]|\d+)\b/)
    }
  })
})
