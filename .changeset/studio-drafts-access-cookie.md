---
"@altafusion/fugue-content": patch
---

Fix the Studio Drafts section never showing to a signed-in editor in production. The access rule compared the `studio-session-check` cookie to the string `'true'`, but `useCookie` parses that value into the boolean `true`, so it was always false. The rule is now `canUsePrivilegedDevTools`, which compares as text like the rest of `fugue-content`, with tests for both forms.
