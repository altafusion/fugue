/** User-facing surfaces must not show Error subclass names from String(err). */
export function toErrorMessage(err: unknown): string {
  return err instanceof Error
    ? err.message
    : String(err)
}
