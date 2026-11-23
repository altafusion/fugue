import type { InjectionKey, Ref } from 'vue'

/**
 * Optional Studio-driven display name from `settings.site.yml` (`siteName`).
 * Provided by `@altafusion/fugue-content` when the settings collection is enabled.
 */
export const shellDisplayNameKey: InjectionKey<Ref<string | undefined>> = Symbol(
  'altafusion:shell-display-name'
)
