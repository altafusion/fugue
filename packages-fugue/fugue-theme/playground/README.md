# Fugue Theme Playground

Private Nuxt app on port 7010. Extends `@altafusion/fugue-theme` and `@altafusion/shell` with no product palette, so heading, body, muted, dimmed, and toned roles can be judged in light and dark.

## Run

From the repo root:

```bash
pnpm play:theme
```

Open http://localhost:7010. The shell header toggles color mode. It also mounts `<DevToolsPanel />`: add `?qetools` to open the drawer.

The workflow playground (`packages-fugue/fugue-workflow/playground`) extends only `@altafusion/fugue-workflow` and does not load fugue-theme, so it still uses Nuxt UI default contrast.
