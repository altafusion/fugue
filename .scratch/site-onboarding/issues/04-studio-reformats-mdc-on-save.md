# Known Behavior: Studio Reformats Hand-Written MDC on First Save

Status: wontfix as a bug; known behavior (2026-11-24)
Priority: P4
Type: investigation
Blocked by: none

On 2026-11-24 a site repo showed an uncommitted change to `content/en/index.md` that changed no content, only syntax. It looked like
Studio's serializer output, so something probably opened and saved the page with Studio (locally or on a dev server). The change was
discarded, so the exact diff is gone.

What the rewrite did:
- The hero's `description` and `title` moved from a front-matter block to inline `{...}` props.
- Five `:u-button{...}` inline components became block components with YAML props.
- The grid `class="..."` became the `{.grid.max-w-md...}` form.

Why it matters (little): it is not a bug. The content renders identically; the only cost is a noisy diff on the first save of a
hand-written page, once per page. Treat it as a known behavior and mention it in the owner docs if it surprises someone.

Open questions:
- Was it Studio, and was it a save or just opening the page? Reproduce on the template with a page that has inline components.
- Is the output stable (does a second save change nothing more)?
- Does the `@altafusion/nuxt-studio` fork behave the same as upstream? If so, it may be worth an upstream issue.
- Does the rewritten form render identically? Compare the built pages.

## Reproduction (2026-11-24)

Ran Studio's own save path outside the browser: `comark` `parseMarkdown` with Studio's plugin set, then `renderMarkdown` with
`blockAttributesStyle: 'frontmatter'` (`nuxt-studio/dist/module/runtime/utils/document/generate.js`, `contentFromMarkdownDocument`), on
the committed `content/en/index.md` of the site.

- **Reproduced.** The output has the same shape as the stray diff: hero props inline in `{...}`, each `:u-button{...}` rewritten as a block
  component with YAML props, and the grid `class` in `{.a.b.c}` form (21 lines became 65). Prop order inside a button differed slightly
  from the stray diff, which probably came from the Studio form editor.
- **Stable.** A second pass over the output changes nothing, so it is a one-time reformat per page, not repeated churn.
- **Lossless for rendering.** The parsed trees (nodes and frontmatter) of the original and the rewritten file are equal.
- **Not the fork.** `generate.js` and the rest of `runtime/utils/document` are byte-identical in `@altafusion/nuxt-studio@1.8.2-altafusion.1` and
  upstream `nuxt-studio@1.8.2`. The style is hardcoded (`blockAttributesStyle: 'frontmatter'`); `comark` offers only `frontmatter` or
  `codeblock`, and a component with no text siblings is always written in block form.
- **Not tested:** clicking save in the Studio UI itself (only the serializer call path).

## Options (optional, P4)

1. Accept it and tell owners to expect a one-time reformat on the first save of a hand-written page.
2. Run the same round trip over all content once, as its own `content:` commit, so later saves produce clean diffs. Cheap, and a good
   step for the template and the doctor/CLI idea.
3. Ask upstream for a setting to choose the style. Needs an issue on `nuxt-content/nuxt-studio`; the fork cannot change it without diverging.

## Comments
