# Changesets

The nine stack packages are released together as one **fixed group**: they always share a version, so a site upgrades
with one bump (`pnpm up '@altafusion/*'`). Apps, templates and the other workspace packages are private and never
versioned or published.

## Adding a Changeset

Run `pnpm changeset` in the PR that changes a stack package. Pick any one package from the group and a bump type; the
fixed group moves every package to the same new version. Write the summary for a site owner, not for this repo.

## Choosing the Bump While the Stack Is 0.x

| Change | Bump |
|---|---|
| Breaks a site (a renamed export, prop, slot, config key or script, a removed file, a new required dependency) | `minor` |
| Anything else (fixes, additions that leave existing sites working) | `patch` |

Sites pin `^0.x.y`, which for 0.x only accepts patch updates, so a `minor` is what makes owners opt in. Reach `1.0.0`
only on purpose, with a `major` changeset.

## Releasing

Merging to `main` runs `.github/workflows/release.yml`:

1. If changesets are pending, it opens or updates a "Version Packages" PR (bumps versions, writes changelogs).
2. Merging that PR publishes every package whose version is not yet on the registry to npm
   (`https://registry.npmjs.org`, public) using the `NPM_TOKEN` repository secret.

To try a change in a site before releasing it, use `pnpm link` or a `pnpm.overrides` entry pointing at a local checkout.

## Adding a New Package

1. Add it to the `fixed` group in `.changeset/config.json`, give it `"license": "MIT"` and
   `"publishConfig": { "access": "public" }`, and let the release publish it.
2. Check that the `NPM_TOKEN` secret can publish to the `altafusion` scope (a granular token scoped to the org covers
   new packages).
