<script setup lang="ts">
import type { Component } from 'vue'
import { landingSectionClasses, landingSectionComponentName, landingSectionProps } from '../../lib/landing'
import FugueContentFragment from './FugueContentFragment.vue'
import LandingHeroMedia from './LandingHeroMedia.vue'

const {
  sectionClass = 'fugue-content-landing-section',
  components,
} = defineProps<{
  /** Base CSS class for each `<section>` — section-based BEM, e.g. `landing-section` */
  sectionClass?: string
  /** Override or extend resolvable section components by name */
  components?: Record<string, Component | string>
}>()

const { sections, pending, error, hasLanding } = useFugueContentLanding()

/** Layer components — auto-imports are not visible to `resolveComponent` in dynamic `:is`. */
const defaultComponents: Record<string, Component> = {
  FugueContentFragment,
  LandingHeroMedia,
}

function resolveSectionComponent(name: string): Component | string {
  if (components?.[name])
    return components[name]
  if (defaultComponents[name])
    return defaultComponents[name]
  const registered = useNuxtApp().vueApp.component(name)
  if (registered)
    return registered as Component
  return resolveComponent(name)
}
</script>

<template>
  <div class="fugue-content-landing flex flex-col">
    <div
      v-if="pending && !hasLanding"
      class="text-muted"
      aria-busy="true"
    />
    <div
      v-else-if="error"
      class="rounded-lg border border-error/30 bg-error/5 p-4 text-sm text-muted"
    >
      Failed to load landing manifest.
    </div>
    <div
      v-else-if="!hasLanding"
      class="rounded-lg border border-dashed border-muted/40 p-4 text-sm text-muted"
    >
      No landing sections configured. Add <code>landing.sections</code> to <code>settings/site.yml</code>.
    </div>
    <section
      v-for="section in sections"
      v-else
      :id="section.anchor"
      :key="`${section.anchor}-${section.slug}`"
      :class="landingSectionClasses(section, sectionClass)"
    >
      <component
        :is="resolveSectionComponent(landingSectionComponentName(section))"
        v-bind="landingSectionProps(section)"
      />
    </section>
  </div>
</template>
