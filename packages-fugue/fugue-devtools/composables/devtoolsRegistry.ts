import type { Component, ComputedRef, Ref } from 'vue'
import { computed, ref, shallowRef } from 'vue'

export type DevToolsSectionAccess = 'public' | 'privileged'

export interface DevToolsSectionDefinition {
  id: string
  label: string
  component: Component
  /** `public` sections show to anyone who opened the drawer; `privileged` (default) need the access resolver to allow it. */
  access?: DevToolsSectionAccess
  order?: number
}

export interface RegisteredDevToolsSection extends DevToolsSectionDefinition {
  access: DevToolsSectionAccess
}

export interface DevToolsRegistry {
  sections: ComputedRef<RegisteredDevToolsSection[]>
  visibleSections: ComputedRef<RegisteredDevToolsSection[]>
  activeId: Ref<string | undefined>
  activeSection: ComputedRef<RegisteredDevToolsSection | undefined>
  registerSection: (section: DevToolsSectionDefinition) => () => void
  /** Reactive: read the site's session inside `resolver`. Privileged sections stay hidden until it returns true. */
  setAccessResolver: (resolver: () => boolean) => void
}

export function createDevToolsRegistry(options: { isDev: boolean }): DevToolsRegistry {
  const map = shallowRef(new Map<string, RegisteredDevToolsSection>())
  const resolver = shallowRef<() => boolean>(() => options.isDev)
  const activeId = ref<string | undefined>()

  const sections = computed(() =>
    [
      ...map.value.values(),
    ].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  )

  const canAccessPrivileged = computed(() => resolver.value() === true)

  const visibleSections = computed(() =>
    sections.value.filter(s => s.access === 'public' || canAccessPrivileged.value),
  )

  const activeSection = computed(() =>
    visibleSections.value.find(s => s.id === activeId.value) ?? visibleSections.value[0],
  )

  function registerSection(section: DevToolsSectionDefinition) {
    const next = new Map(map.value)
    next.set(section.id, { ...section, access: section.access ?? 'privileged' })
    map.value = next
    return () => {
      const after = new Map(map.value)
      after.delete(section.id)
      map.value = after
    }
  }

  function setAccessResolver(next: () => boolean) {
    resolver.value = next
  }

  return {
    sections,
    visibleSections,
    activeId,
    activeSection,
    registerSection,
    setAccessResolver,
  }
}
