import { describe, expect, it } from 'vitest'
import {
  formatFileSize,
  hasAcceptedExtension,
  isWithinMaxSize,
  toAcceptAttribute,
  validateFile,
} from './fileDropzone.shared'

function fileWithSize(name: string, size: number): File {
  const file = new File([
    'x'.repeat(size),
  ], name)
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('hasAcceptedExtension', () => {
  it('matches exact extension', () => {
    expect(hasAcceptedExtension('archive.zip', ['.zip'])).toBe(true)
  })

  it('matches case-insensitively', () => {
    expect(hasAcceptedExtension('archive.ZIP', ['.zip'])).toBe(true)
    expect(hasAcceptedExtension('archive.zip', ['.ZIP'])).toBe(true)
  })

  it('matches multi-part extensions', () => {
    expect(hasAcceptedExtension('archive.tar.gz', ['.tar.gz'])).toBe(true)
  })

  it('rejects non-matching extensions', () => {
    expect(hasAcceptedExtension('archive.rar', ['.zip'])).toBe(false)
  })

  it('normalizes entries without a leading dot', () => {
    expect(hasAcceptedExtension('archive.zip', ['zip'])).toBe(true)
  })

  it('accepts all when accept is empty or undefined', () => {
    expect(hasAcceptedExtension('anything.rar', undefined)).toBe(true)
    expect(hasAcceptedExtension('anything.rar', [])).toBe(true)
  })
})

describe('isWithinMaxSize', () => {
  it('accepts files under the limit', () => {
    expect(isWithinMaxSize(1023, 1024)).toBe(true)
  })

  it('accepts files exactly at the limit', () => {
    expect(isWithinMaxSize(2048, 2048)).toBe(true)
  })

  it('rejects files over the limit', () => {
    expect(isWithinMaxSize(2049, 2048)).toBe(false)
  })

  it('accepts any size when maxSize is undefined, zero, or negative', () => {
    expect(isWithinMaxSize(Number.MAX_SAFE_INTEGER, undefined)).toBe(true)
    expect(isWithinMaxSize(Number.MAX_SAFE_INTEGER, 0)).toBe(true)
    expect(isWithinMaxSize(Number.MAX_SAFE_INTEGER, -1)).toBe(true)
  })
})

describe('validateFile', () => {
  it('returns null when the file is acceptable', () => {
    const file = fileWithSize('data.zip', 512)
    expect(validateFile(file, {
      accept: ['.zip'],
      maxSize: 1024,
    })).toBeNull()
  })

  it('returns extension rejection', () => {
    const file = fileWithSize('data.rar', 512)
    const rejection = validateFile(file, {
      accept: ['.zip'],
      maxSize: 1024,
    })
    expect(rejection).toEqual({
      file,
      reason: 'extension',
      accept: ['.zip'],
      maxSize: 1024,
    })
  })

  it('returns size rejection', () => {
    const file = fileWithSize('data.zip', 4096)
    const rejection = validateFile(file, {
      accept: ['.zip'],
      maxSize: 2048,
    })
    expect(rejection).toEqual({
      file,
      reason: 'size',
      accept: ['.zip'],
      maxSize: 2048,
    })
  })

  it('prefers extension rejection when both fail', () => {
    const file = fileWithSize('data.rar', 4096)
    const rejection = validateFile(file, {
      accept: ['.zip'],
      maxSize: 2048,
    })
    expect(rejection?.reason).toBe('extension')
  })

  it('rejects a zero-byte file, which is also how a dropped folder arrives', () => {
    const file = fileWithSize('data.zip', 0)
    expect(validateFile(file, {
      accept: ['.zip'],
      maxSize: 1024,
    })?.reason).toBe('empty')
  })

  it('rejects an empty file even with no constraints to check against', () => {
    expect(validateFile(fileWithSize('data.zip', 0), {})?.reason).toBe('empty')
  })
})

describe('formatFileSize', () => {
  it('formats zero bytes', () => {
    expect(formatFileSize(0)).toBe('0 B')
  })

  it('formats fractional kilobytes', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB')
  })

  it('formats whole gigabytes without trailing decimal', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB')
  })
})

describe('toAcceptAttribute', () => {
  it('offers the extension and its media types', () => {
    expect(toAcceptAttribute(['.zip'])).toBe(
      '.zip,application/zip,application/x-zip-compressed',
    )
  })

  it('adds the final segment of a compound extension, which the picker matches on', () => {
    expect(toAcceptAttribute(['.tar.gz'])).toBe(
      '.tar.gz,.gz,application/gzip,application/x-gzip',
    )
  })

  it('does not repeat tokens shared by several entries', () => {
    expect(toAcceptAttribute(['.tar.gz', '.tgz'])).toBe(
      '.tar.gz,.gz,application/gzip,application/x-gzip,.tgz',
    )
  })

  it('falls back to the extension alone when no media type is known', () => {
    expect(toAcceptAttribute(['.tar.bz2'])).toBe('.tar.bz2,.bz2')
  })

  it('widens the picker without widening validation', () => {
    expect(toAcceptAttribute(['.tar.gz'])).toContain('.gz')
    expect(hasAcceptedExtension('archive.gz', ['.tar.gz'])).toBe(false)
  })

  it('returns undefined for empty or undefined accept', () => {
    expect(toAcceptAttribute(undefined)).toBeUndefined()
    expect(toAcceptAttribute([])).toBeUndefined()
  })
})
