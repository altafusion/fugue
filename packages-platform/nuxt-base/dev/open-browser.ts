/**
 * Open dev URL reusing an existing Chromium tab when possible (same behavior as Vite's server.open).
 * Nuxt `dev --open` goes through listhen → macOS `open`, which always spawns a new tab.
 */
import { exec, execFile } from 'node:child_process'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execAsync = promisify(exec)
const execFileAsync = promisify(execFile)

const openChromiumScriptDir = dirname(fileURLToPath(import.meta.url))

const supportedChromiumBrowsers = [
  'Google Chrome Canary',
  'Google Chrome Dev',
  'Google Chrome Beta',
  'Google Chrome',
  'Microsoft Edge',
  'Brave Browser',
  'Vivaldi',
  'Chromium',
]

const chromiumBrowserAliases: Record<string, string> = {
  'chrome': 'Google Chrome',
  'google chrome': 'Google Chrome',
  'edge': 'Microsoft Edge',
  'microsoft edge': 'Microsoft Edge',
  'brave': 'Brave Browser',
  'brave browser': 'Brave Browser',
}

/** openChrome.js uses `tab.url().includes(lookupUrl)` — drop trailing slash so paths match. */
export function normalizeDevOpenUrl(url: string): string {
  try {
    const parsed = new URL(url)
    if (parsed.pathname.length > 1) {
      parsed.pathname = parsed.pathname.replace(/\/$/, '')
    } else if (!parsed.search && !parsed.hash) {
      // Origin-only URLs (e.g. http://localhost:3000/) — drop trailing slash for tab reuse.
      return parsed.href.replace(/\/$/, '')
    }
    return parsed.href
  } catch {
    return url.replace(/\/$/, '')
  }
}

export function resolveOpenedChromiumBrowser(
  browser: string | undefined,
  psStdout: string,
): string | undefined {
  if (browser) {
    const normalized = browser.toLowerCase().trim()
    if (Object.hasOwn(chromiumBrowserAliases, normalized))
      return chromiumBrowserAliases[normalized]
    const match = supportedChromiumBrowsers.find(name => name.toLowerCase() === normalized)
    // Explicit non-Chromium preference (e.g. Safari) — skip tab reuse, fall through to `open`.
    return match
  }
  return supportedChromiumBrowsers.find(name => psStdout.includes(name))
}

let devBrowserOpenScheduledThisProcess = false

/** Skip repeat opens when Nuxt re-fires `listen` on dev restart (same Node process). */
export function scheduleOpenDevBrowserOnce(url: string, logPrefix = '[nuxt-base]'): void {
  if (devBrowserOpenScheduledThisProcess)
    return
  devBrowserOpenScheduledThisProcess = true
  void openDevBrowser(url).catch((err) => {
    console.warn(`${logPrefix} Failed to open browser:`, err)
  })
}

export async function openDevBrowser(url: string): Promise<void> {
  if (process.env.NUXT_DEV_OPEN === 'false')
    return

  const browser = process.env.BROWSER
  if (browser?.toLowerCase() === 'none')
    return

  const lookupUrl = normalizeDevOpenUrl(url)

  if (process.platform === 'darwin') {
    try {
      const psStdout = browser
        ? ''
        : (await execAsync('ps cax')).stdout
      const openedBrowser = resolveOpenedChromiumBrowser(browser, psStdout)
      if (openedBrowser) {
        await execFileAsync(
          'osascript',
          [
            join(openChromiumScriptDir, 'openChromiumWithoutReload.js'),
            lookupUrl,
            openedBrowser,
          ],
        )
        return
      }
    } catch {
      // fall through to generic open
    }
  }

  type OpenFn = (_target: string, _options?: { app?: { name: string } }) => Promise<unknown>
  const { default: open } = await import('open') as { default: OpenFn }
  await open(lookupUrl, browser
    ? {
        app: { name: browser },
      }
    : undefined)
}
