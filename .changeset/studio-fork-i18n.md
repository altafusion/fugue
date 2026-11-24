---
'@altafusion/fugue-content': patch
---

Install `nuxt-studio` from the `@altafusion/nuxt-studio` fork (1.8.2 plus the host `@nuxtjs/i18n` locale fix from upstream PR 501 and the media id quoting fix). Studio labels no longer show raw `studio.*` keys on sites that use `@nuxtjs/i18n`, and sites no longer need their own `nuxt-studio@1.8.2` patch: delete `patches/nuxt-studio@1.8.2.patch` and its `patchedDependencies` entry when updating, or pnpm reports an unused patch.
