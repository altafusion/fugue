---
'@altafusion/fugue-theme': minor
---

Rename the light/dark state key from `sse:theme` to `fugue:theme`, and drop the one-time localStorage migration from legacy workflow and recipe keys in `@altafusion/fugue-workflow`. Code that reads `useState('sse:theme')` directly must use the new key.
