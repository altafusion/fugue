---
'@altafusion/fugue-content': minor
---

Remove the page-level Edit button from the `article` and `article-aside` layouts. It repeated Studio's own "Edit this page" button and, being an in-flow row, pushed the page content down for editors. The `stem` prop of `FugueContentLayoutArticle` is gone with it. The footer Edit entry now shows only to visitors without a Studio session (it is the way in to `/login`), and fragment Edit buttons are unchanged.
