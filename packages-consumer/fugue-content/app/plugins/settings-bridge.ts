import type { FugueContentSettings } from '../composables/useFugueContentSettings'
import { FUGUE_CONTENT_SETTINGS_STATE } from '../../lib/settings-state'

/**
 * Publish CMS settings for cross-layer consumers (e.g. fugue-theme dark canvas).
 */
export default defineNuxtPlugin(() => {
  const { settings } = useFugueContentSettings()
  const fugueContentSettings = useState<FugueContentSettings | null>(FUGUE_CONTENT_SETTINGS_STATE, () => null)

  watch(settings, (value) => {
    fugueContentSettings.value = value
  }, { immediate: true })
})
