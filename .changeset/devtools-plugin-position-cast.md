---
"@altafusion/fugue-devtools": patch
---

Fix a typecheck error in consuming sites: the plugin passed the runtime-config `defaultPosition` (typed `string`) to `panelPosition`, which only accepts `'left' | 'right' | 'top' | 'bottom'`.

The layer now also ships its type augmentations (`$fugueDevtools`, runtime config) to sites that extend it, and the fugue-ui playground's devtools plugin is left out of the type-check of other apps, so `pnpm typecheck` is green.
