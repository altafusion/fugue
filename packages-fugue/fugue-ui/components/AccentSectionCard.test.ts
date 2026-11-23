import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref, useAttrs, watch } from 'vue'
import AccentSectionCard from './AccentSectionCard.vue'

beforeEach(() => {
  vi.stubGlobal('ref', ref)
  vi.stubGlobal('computed', computed)
  vi.stubGlobal('watch', watch)
  vi.stubGlobal('useAttrs', useAttrs)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const UCardStub = {
  name: 'UCard',
  props: [
    'as',
    'variant',
    'description',
    'class',
    'ui',
    'style',
  ],
  template: '<div data-testid="ucard"><slot name="header" /><slot name="title" /><slot name="description" /><slot /><slot name="footer" /></div>',
}

describe('accentSectionCard', () => {
  it('applies fallthrough class on the shell root, not UCard', () => {
    const wrapper = mount(AccentSectionCard, {
      props: { title: 'Section', class: 'mt-4 max-w-xl' },
      global: {
        stubs: {
          UCard: UCardStub,
          UIcon: true,
          UButton: true,
          TileHintTooltip: true,
        },
      },
    })

    const shell = wrapper.element as HTMLElement
    expect(shell.classList.contains('mt-4')).toBe(true)
    expect(shell.classList.contains('max-w-xl')).toBe(true)
    expect(shell.classList.contains('relative')).toBe(true)

    const card = wrapper.findComponent({ name: 'UCard' })
    expect(card.props('class')).toBeUndefined()
  })

  it('forwards variant to UCard', () => {
    const wrapper = mount(AccentSectionCard, {
      props: { title: 'Section', variant: 'subtle' },
      global: {
        stubs: {
          UCard: UCardStub,
          UIcon: true,
          UButton: true,
          TileHintTooltip: true,
        },
      },
    })

    const card = wrapper.findComponent({ name: 'UCard' })
    expect(card.props('variant')).toBe('subtle')
  })

  it('wraps header icon in accent-section-icon with size-full UIcon', () => {
    const wrapper = mount(AccentSectionCard, {
      props: { title: 'Section', icon: 'i-lucide-box' },
      global: {
        stubs: {
          UCard: UCardStub,
          UIcon: {
            template: '<span data-testid="uicon" :class="$attrs.class" />',
          },
          UButton: true,
          TileHintTooltip: true,
        },
      },
    })

    const iconShell = wrapper.find('.accent-section-icon')
    expect(iconShell.exists()).toBe(true)
    const icon = wrapper.find('[data-testid="uicon"]')
    expect(icon.classes()).toContain('size-full')
  })
})
