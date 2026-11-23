export type FileRejectionReason = 'extension' | 'empty' | 'size'

export interface FileRejection {
  file: File
  reason: FileRejectionReason
  /** Echoed back so the consumer can build its own message. */
  accept?: string[]
  maxSize?: number
}

export interface FileConstraints {
  /**
   * Permitted file **extensions**, with or without the leading dot (`.zip`, `zip`).
   * Media types are not accepted here: `image/png` would be normalized to
   * `.image/png` and match no file name. Add media-type matching against
   * `file.type` if a consumer ever needs it — no caller does today.
   */
  accept?: string[]
  maxSize?: number
}

function normalizeExtension(ext: string): string {
  const lower = ext.toLowerCase()
  return lower.startsWith('.')
    ? lower
    : `.${lower}`
}

export function hasAcceptedExtension(fileName: string, accept?: string[]): boolean {
  if (!accept || accept.length === 0)
    return true

  const lowerName = fileName.toLowerCase()
  return accept.some(ext => lowerName.endsWith(normalizeExtension(ext)))
}

export function isWithinMaxSize(sizeBytes: number, maxSize?: number): boolean {
  if (maxSize === undefined || maxSize <= 0)
    return true

  return sizeBytes <= maxSize
}

export function validateFile(file: File, constraints: FileConstraints): FileRejection | null {
  if (!hasAcceptedExtension(file.name, constraints.accept)) {
    return {
      file,
      reason: 'extension',
      accept: constraints.accept,
      maxSize: constraints.maxSize,
    }
  }

  // Zero bytes is never something to send, and it is also how browsers report a
  // dropped folder — which would otherwise look like a valid pick until the server
  // turned it away.
  if (file.size === 0) {
    return {
      file,
      reason: 'empty',
      accept: constraints.accept,
      maxSize: constraints.maxSize,
    }
  }

  if (!isWithinMaxSize(file.size, constraints.maxSize)) {
    return {
      file,
      reason: 'size',
      accept: constraints.accept,
      maxSize: constraints.maxSize,
    }
  }

  return null
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0)
    return '0 B'

  const units = ['B', 'KB', 'MB', 'GB'] as const
  const base = 1024
  let value = bytes
  let unitIndex = 0

  while (value >= base && unitIndex < units.length - 1) {
    value /= base
    unitIndex++
  }

  const formatted = unitIndex === 0
    ? String(value)
    : value.toFixed(1).replace(/\.0$/, '')

  return `${formatted} ${units[unitIndex]}`
}

/**
 * Media types to offer the picker alongside an extension, keyed by extension.
 *
 * Some platforms match `accept` against the file's reported type rather than its
 * name, where an extension token alone leaves the file greyed out. Only archive
 * formats are listed; an unmapped extension simply contributes its own token.
 */
const MEDIA_TYPES_BY_EXTENSION: Record<string, readonly string[]> = {
  '.zip': ['application/zip', 'application/x-zip-compressed'],
  '.tar': ['application/x-tar'],
  '.gz': ['application/gzip', 'application/x-gzip'],
  '.tgz': ['application/gzip', 'application/x-gzip'],
}

/**
 * `accept` for the native file dialog, deliberately wider than the validation list.
 *
 * Browsers match `accept` on the final extension segment only, so `.tar.gz` on its
 * own leaves `app.tar.gz` unselectable in the picker. Emitting `.gz` and the media
 * types alongside it makes the file selectable; `validateFile` still turns away a
 * bare `.gz`, so the widening never loosens what is actually accepted.
 */
export function toAcceptAttribute(accept?: string[]): string | undefined {
  if (!accept || accept.length === 0)
    return undefined

  const tokens = new Set<string>()

  for (const entry of accept) {
    const extension = normalizeExtension(entry)
    tokens.add(extension)

    const finalSegment = extension.slice(extension.lastIndexOf('.'))
    if (finalSegment !== extension)
      tokens.add(finalSegment)

    for (const mediaType of MEDIA_TYPES_BY_EXTENSION[finalSegment] ?? [])
      tokens.add(mediaType)
  }

  return [...tokens].join(',')
}
