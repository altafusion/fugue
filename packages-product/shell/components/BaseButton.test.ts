/**
 * Example test — BaseButton component
 * Uses @vue/test-utils for Vue component testing
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BaseButton from './BaseButton.vue'

describe('baseButton', () => {
  it('renders with default slot', () => {
    const wrapper = mount(BaseButton, {
      slots: { default: 'Click me' }
    })
    expect(wrapper.text()).toBe('Click me')
  })

  it('applies primary variant', () => {
    const wrapper = mount(BaseButton, {
      props: { variant: 'primary' },
      slots: { default: 'Primary' }
    })
    expect(wrapper.find('button').classes()).toContain('base-button--primary')
  })
})
