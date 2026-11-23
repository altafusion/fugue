import type { FugueContentI18nLocale } from './i18n-utils'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { localeCodeFromEntry } from './i18n-utils'

/** Locales that have a `content/{code}/` folder (warn and skip others). */
export function resolveI18nLocaleCodes(
  rootDir: string,
  locales: FugueContentI18nLocale[],
  onMissing?: (_code: string) => void
): string[] {
  return locales
    .map(localeCodeFromEntry)
    .filter((code) => {
      const folder = join(rootDir, 'content', code)
      if (!existsSync(folder)) {
        onMissing?.(code)
        return false
      }
      return true
    })
}
