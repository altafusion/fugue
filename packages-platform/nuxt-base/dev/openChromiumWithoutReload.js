/*
 * Vite openChrome.js behavior without targetTab.reload().
 * Nuxt re-fires `listen` on dev restart; reload would full-page refresh (not HMR).
 *
 * Based on Vite packages/vite/bin/openChrome.js (MIT).
 */

/* global Application */

// osascript JXA invokes `run` with CLI args (see dev/open-browser.ts).
// eslint-disable-next-line no-unused-vars, unused-imports/no-unused-vars -- JXA entry point
function run(argv) {
  const urlToOpen = argv[0]
  const programName = argv[1] ?? 'Google Chrome'

  const app = Application(programName)

  if (app.windows.length === 0)
    app.Window().make()

  const found = lookupTabWithUrl(urlToOpen, app)
  if (found) {
    found.targetWindow.activeTabIndex = found.targetTabIndex
    found.targetWindow.index = 1
    app.activate()
    return
  }

  const emptyTabFound = lookupTabWithUrl('://newtab/', app)
  if (emptyTabFound) {
    emptyTabFound.targetWindow.activeTabIndex = emptyTabFound.targetTabIndex
    emptyTabFound.targetTab.url = urlToOpen
    app.activate()
    return
  }

  const firstWindow = app.windows[0]
  firstWindow.tabs.push(app.Tab({ url: urlToOpen }))
  app.activate()
}

function lookupTabWithUrl(lookupUrl, app) {
  const windows = app.windows()
  for (const window of windows) {
    for (const [tabIndex, tab] of window.tabs().entries()) {
      const tabUrl = tab.url()
      if (tabUrl && tabUrl.includes(lookupUrl)) {
        return {
          targetTab: tab,
          targetTabIndex: tabIndex + 1,
          targetWindow: window,
        }
      }
    }
  }
}
