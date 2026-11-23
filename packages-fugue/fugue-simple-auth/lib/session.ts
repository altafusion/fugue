import { Buffer } from 'node:buffer'
import { createHmac, timingSafeEqual } from 'node:crypto'

export function keysMatch(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided.trim())
  const expectedBuffer = Buffer.from(expected.trim())

  if (providedBuffer.length !== expectedBuffer.length)
    return false

  return timingSafeEqual(providedBuffer, expectedBuffer)
}

export function createSessionToken(accessKey: string, sessionLabel: string): string {
  return createHmac('sha256', accessKey)
    .update(sessionLabel)
    .digest('base64url')
}

export function verifySessionToken(
  token: string,
  accessKey: string,
  sessionLabel: string
): boolean {
  const expected = createSessionToken(accessKey, sessionLabel)

  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  } catch {
    return false
  }
}
