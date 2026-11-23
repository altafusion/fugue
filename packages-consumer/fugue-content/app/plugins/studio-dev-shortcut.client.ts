import { FUGUE_CONTENT_STUDIO_OPEN_EVENT } from '../../lib/studio-open'

/**
 * Dev-only: header **Edit** opens Studio in-page; **⌘.** / **Ctrl+.** is the keyboard alias.
 */
export default defineNuxtPlugin({
  name: 'fugue-content:studio-dev-shortcut',
  setup() {
    if (!import.meta.dev)
      return

    const { openEditor } = useFugueContentStudioEditorEntry()

    const open = () => {
      void openEditor()
    }

    window.addEventListener(FUGUE_CONTENT_STUDIO_OPEN_EVENT, open)

    defineShortcuts({
      'meta_.': open
    })
  }
})
