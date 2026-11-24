---
'@altafusion/fugue-content': patch
'@altafusion/eslint-config': patch
'@altafusion/test-kit': patch
---

Standalone sites no longer fail on first lint or test run. `fugueContentStudioSection` takes optional `owner` and `repo`
(defaults unchanged). `@altafusion/eslint-config` now requires its `@antfu/eslint-config` and `eslint` peers instead of
marking them optional, and `@altafusion/test-kit` depends on `happy-dom` directly.
