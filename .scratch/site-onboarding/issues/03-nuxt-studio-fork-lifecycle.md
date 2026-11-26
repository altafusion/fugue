# Keep the nuxt-studio Fork Healthy Until Upstream Ships

Status: ready-for-human
Type: task
Blocked by: none

`@altafusion/nuxt-studio@1.8.2-altafusion.1` (repo `altafusion/nuxt-studio`) carries the host `@nuxtjs/i18n` fix from upstream PR 501
and the media id quoting fix. `@altafusion/fugue-content` depends on it under the name `nuxt-studio` (since 0.3.5).

## Open

- Upstream PR 501: a comment was posted on 2026-11-24 asking the maintainer why it is unmerged; no reply yet. Retire the fork when
  it ships.
- The npm trusted publisher is configured (set with the CLI after the web form returned 429) but not proven: the first CI publish
  tests it.
- Rebase the fork on each upstream release and publish a new `1.8.x-altafusion.N`.
- Retire: point `catalogs.content.nuxt-studio` in this repo back at plain `nuxt-studio`, release, deprecate the fork package,
  archive the fork repo.

## Comments
