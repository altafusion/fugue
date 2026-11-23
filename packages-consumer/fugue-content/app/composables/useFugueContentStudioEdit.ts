import { fragmentFsPath, pageFsPath } from '../../lib/i18n-utils'
import { requestFugueContentStudioDocumentEdit } from '../../lib/studio-document-edit'
import { resolveFugueContentShowFragmentEdit } from '../../lib/studio-editor-visibility'

/**
 * Open embedded fragments or routed pages in Nuxt Studio (local dev and production after `/login`).
 * Uses the same `studio:document:edit` hook as Studio's dbl-click and "Edit this page" controls.
 */
export function useFugueContentStudioEdit() {
  const { locale, isEnabled, defaultLocale } = useFugueContentI18n()
  const { isAuthenticated } = useFugueContentStudioSession()

  const canEdit = computed(() => resolveFugueContentShowFragmentEdit({
    isAuthenticated: isAuthenticated.value
  }))

  async function editFragment(slug: string) {
    if (!canEdit.value)
      return

    const fsPath = fragmentFsPath(slug, locale.value, defaultLocale.value, isEnabled.value)
    await requestFugueContentStudioDocumentEdit(fsPath)
  }

  async function editPage(stem: string) {
    if (!canEdit.value || !stem)
      return

    const fsPath = pageFsPath(stem, locale.value, defaultLocale.value, isEnabled.value)
    await requestFugueContentStudioDocumentEdit(fsPath)
  }

  return {
    canEdit,
    editFragment,
    editPage
  }
}
