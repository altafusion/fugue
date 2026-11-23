# Docus site template

Starter for a **standalone** or monorepo **documentation** site: **`docus`** + **Nuxt Studio** (no read gate in the template).

**Moving out of the monorepo?** **[Standalone settings checklist](/docs-site/setup/standalone-settings)** · **[Scaffold](/docs-site/setup/standalone-scaffold)** · **[EXTRACT.md](./EXTRACT.md)**.

**Workspace package:** `@altafusion/docus-site-template` at `templates/docus-site/`.

## Layer stack

```text
extends: ['docus'] + nuxt-studio + local Studio chrome (Edit Content)
```

**Not** on the product chain (`fugue-theme` / `shell`). Doc chrome comes from **Docus**.

| Owns | Notes |
|------|--------|
| `content/**` | Landing + docs |
| `app/components/app/AppHeader.vue` | **`<DocusEditContent />`** (local) |
| `nuxt.config.ts` | `studio.repository`, `@altafusion/nuxt-base` dev ports |

**Optional read gate:** extend **`@altafusion/fugue-simple-auth`** on the app — see the fugue-simple-auth README.


## Use in this monorepo

1. Copy to `apps/<name>/` or smoke-test in place.
2. Set `site` and `studio.repository` in `nuxt.config.ts`.
3. Add a dev port in `dev/ports.ts` and `pnpm dev:<name>` when promoting to `apps/`.

**Smoke test:** `pnpm --filter @altafusion/docus-site-template build`.

Default dev port **8002** (`templateDevPorts.docusSite`). Standalone extract: **7001** for Studio OAuth — **EXTRACT.md**.

## Deploy checklist

- [ ] Google OAuth app + PAT on Netlify **Functions**
- [ ] SSR deploy (bundled `server` function in Netlify summary)

If you add **`fugue-simple-auth`**: `{PREFIX}_ACCESS_KEY` on Functions, `{PREFIX}_AUTH_ENABLED` on Builds — **`/docs-site/setup/requirements`**.
