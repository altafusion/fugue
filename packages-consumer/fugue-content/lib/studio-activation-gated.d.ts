/** Types for `studio-activation-gated.js`. */

/** The editor session handed to the Studio host; the dev user has a fixed shape, production users come from the session route. */
export interface StudioActivationUser {
  provider?: string
  email?: string
  name?: string
  accessToken?: string
  providerId?: string
  avatar?: string
  [key: string]: unknown
}

/** Activates Studio once the access-key session is valid; resolves true when the Studio host is mounted. */
export declare function ensureStudioActivation(): Promise<boolean>

/** Registers the Studio activation for the current session (dev shortcut, production session check, or Cmd+. login). */
export declare function defineStudioActivationPlugin(
  onStudioActivation: (user: StudioActivationUser) => unknown
): Promise<void>
