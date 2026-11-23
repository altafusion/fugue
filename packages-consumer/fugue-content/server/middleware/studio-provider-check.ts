import process from 'node:process'

/**
 * Clear operator error when Studio OAuth env vars are missing on `/_studio`.
 * Without this, nuxt-studio's admin route returns an opaque 404.
 */
export default defineEventHandler((event) => {
  const runtimeConfig = useRuntimeConfig(event)
  const studioRoute = runtimeConfig.public.studio?.route ?? '/_studio'
  const { pathname } = getRequestURL(event)

  if (pathname !== studioRoute)
    return

  const providers = [
    process.env.STUDIO_GITHUB_CLIENT_ID && 'GitHub',
    process.env.STUDIO_GITLAB_APPLICATION_ID && 'GitLab',
    process.env.STUDIO_GOOGLE_CLIENT_ID && 'Google',
    process.env.STUDIO_SSO_URL
    && process.env.STUDIO_SSO_CLIENT_ID
    && process.env.STUDIO_SSO_CLIENT_SECRET
    && 'SSO'
  ].filter(Boolean)

  if (providers.length > 0)
    return

  const authMode = runtimeConfig.public.fugueContent?.authMode ?? 'off'
  const afterSetup = authMode === 'peek'
    ? 'After that, sign in at <code>/login</code> and use the footer <strong>Edit</strong> button.'
    : 'After that, use the footer <strong>Edit</strong> button to sign in with Google.'

  setResponseStatus(event, 503, 'Studio OAuth not configured')
  setResponseHeader(event, 'content-type', 'text/html; charset=utf-8')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Studio Not Configured</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 3rem auto; padding: 0 1rem; line-height: 1.5; }
    h1 { font-size: 1.25rem; }
    code { background: #f4f4f5; padding: 0.1em 0.35em; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Studio OAuth Is Not Configured</h1>
  <p>
    This deploy is missing Studio editor credentials.
    Set <code>STUDIO_GOOGLE_CLIENT_ID</code>, <code>STUDIO_GOOGLE_CLIENT_SECRET</code>,
    and <code>STUDIO_GOOGLE_MODERATORS</code> on <strong>Netlify Functions</strong>
    (plus <code>STUDIO_GITHUB_TOKEN</code> for publish), then redeploy.
  </p>
  <p>${afterSetup}</p>
</body>
</html>`
})
