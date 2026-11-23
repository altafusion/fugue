# Extract checklist — standalone docs repo

Use this before moving a monorepo app (e.g. a gated docs site) to its own repository. Copy **`templates/docus-site/`** — the starter is self-contained (**`docus`** + **`nuxt-studio`** + local Studio files).

**Operator guide:** **[Scaffold a standalone docs repo](/docs-site/setup/standalone-scaffold)** · this file is the repo-side checklist.

## Phase 0 — Ready in monorepo

- [ ] `pnpm --filter @altafusion/docus-site-template build` passes
- [ ] `pnpm build` passes in the app
- [ ] Studio publish (+ read gate if used) verified on staging or production

## Phase 1 — Create the new repo

1. Copy **`templates/docus-site/`** to the new repo root.
2. Copy product **`content/`** (e.g. `apps/<site>/content/`).
3. Rename **`package.json`** → `"@your-org/your-docs"`.
4. Replace **`MY_DOCS`** env prefix in **`nuxt.config.ts`**, **`.env.example`**, **`netlify.toml`** if needed.
5. Update **`nuxt.config.ts`**: `site`, **`studio.repository`** (new GitHub repo), **remove** **`rootDir`**.
6. For a **read gate**, add **`@altafusion/fugue-simple-auth`** + auth block — copy from your gated app (`DocusHeaderSignOut`, **`useDocusSignOut`**).
7. Keep **`scripts/dev.mjs`** — not bare **`nuxt dev`** on macOS (see **README**).
8. Standalone default port **7001**, **`localhost`** host — Studio OAuth URIs.
9. Root **`pnpm-workspace.yaml`**: **`packages: ['.']`**, **`nodeLinker: hoisted`**.

## Phase 2 — Dependencies

Use **`package.standalone.json`** as a pin reference. Runtime: **`docus`**, **`nuxt`**, **`vue`**, **`better-sqlite3`**, **`@nuxt/content`**, **`@takumi-rs/core`**, **`nuxt-studio`**.

Optional gated site: **`@altafusion/fugue-simple-auth`** via npm or git (`path:packages-fugue/fugue-simple-auth`).

## Phase 3 — Netlify

**[Standalone settings checklist](/docs-site/setup/standalone-settings)** — SSR deploy, Google OAuth, PATs.

## Phase 4 — Studio cutover

Google redirect `https://<host>/__nuxt_studio/auth/google`, **`STUDIO_GITHUB_TOKEN`** on new repo, test publish to **`content/`**.

## References

- **`templates/docus-site/README.md`**
- **[Standalone scaffold](/docs-site/setup/standalone-scaffold)** · **[Studio — Google](/docs-site/setup/studio-google)**
