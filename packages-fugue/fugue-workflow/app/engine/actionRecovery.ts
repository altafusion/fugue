/**
 * A failed action whose cause lives on an earlier step, carrying the step that owns
 * the fix — a dead upload session belongs to the step that produced it, not to the
 * submit step that discovered it.
 *
 * `onError` in YAML is static: one target for every failure of that action. A deploy
 * rejected for a bad runtime setting and a deploy rejected for an expired archive
 * would land in the same place, so the config can only be right for one of them. The
 * handler is what knows which failure it got, so it names the step and the engine
 * only routes.
 */
export class RecoverableActionError extends Error {
  /** Step id the user is sent to in order to repair the failure. */
  readonly recoverAt: string

  constructor(message: string, recoverAt: string) {
    super(message)
    this.name = 'RecoverableActionError'
    this.recoverAt = recoverAt
  }
}

/** The step a thrown error asks to return to, when it is one of ours. */
export function recoveryStepId(err: unknown): string | undefined {
  return err instanceof RecoverableActionError
    ? err.recoverAt
    : undefined
}
