---
"@altafusion/fugue-content": patch
"@altafusion/fugue-devtools": patch
---

Add buttons to the Studio drafts section of the dev tools drawer, and show it to signed-in editors in production.

- **Delete Matching** removes every draft whose key contains some text (`qeTools.studioDrafts.deleteMatching`), **Clear All Drafts** removes them all after a second click to confirm (`clearAll`), each row shows its status, and a **Reload Page To Apply** button appears after a delete (Studio keeps a merged copy in memory).
- The section is privileged, and without an access resolver it only showed in development. `fugue-content` now sets one: development, or a signed-in Studio editor (the `studio-session-check` cookie). A site that wants a different rule calls `setAccessResolver` after it. It is a UI convenience, not a security boundary: the section only touches the browser's own drafts.
- The section is now called **Studio Drafts**, comes first so it opens by default, and sits in a thin bordered card (`max-w-xl`) with Refresh and Clear All Drafts at the top, Delete Matching under them, then the list.
- The drawer's section switcher is a Nuxt UI `UTabs` (pill, no content) instead of a row of buttons, and a section no longer repeats its title under the tabs; with a single section there are no tabs, so the title still shows.
