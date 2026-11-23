import { resolveDarkCanvas } from '../../lib/dark-canvas'

/** Shared with `@altafusion/fugue-content` settings bridge plugin. */
const FUGUE_CONTENT_SETTINGS_STATE = 'fugue-content:settings'

/**
 * Applies html[data-dark-canvas] for base dark canvas tokens (gray vs black).
 * CMS apps may publish settings into `fugue-content:settings` to override at runtime.
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const fugueContentSettings = useState<{ theme?: { darkCanvas?: string } } | null>(FUGUE_CONTENT_SETTINGS_STATE, () => null)

  const darkCanvas = computed(() =>
    resolveDarkCanvas(
      fugueContentSettings.value?.theme?.darkCanvas,
      config.public.darkCanvas,
      'gray',
    ),
  )

  useHead({
    htmlAttrs: {
      'data-dark-canvas': darkCanvas,
    },
  })
})
