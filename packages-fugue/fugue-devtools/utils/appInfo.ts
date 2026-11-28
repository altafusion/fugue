/** The site running the dev tools: its `package.json` name and version, and the commit it was built from. */
export interface AppInfo {
  name?: string
  version?: string
  /** Full or short commit hash of the build (Netlify's `COMMIT_REF`, GitHub's `GITHUB_SHA`, else `git rev-parse HEAD`). */
  commit?: string
}

/** `camilajessica 0.1.0 (9e5769e)`; any missing part is left out, and `undefined` when there is nothing to show. */
export function formatAppInfo(app?: AppInfo): string | undefined {
  if (!app)
    return undefined
  const label = [app.name, app.version].filter(Boolean).join(' ')
  const commit = app.commit
    ? `(${app.commit.slice(0, 7)})`
    : ''
  return [label, commit].filter(Boolean).join(' ') || undefined
}
