# Site Owner Guide

The `@altafusion/*` stack packages are public on npm under the MIT license. A site repo installs them like any other
dependency, with no token and no registry setting:

```sh
pnpm add @altafusion/shell
```

The nine packages are released as one fixed group, so they always share a version (see `.changeset/README.md`).
Upgrade them together with `pnpm up '@altafusion/*'`. The decision and its reasons are in
`docs/adr/0001-public-npm-and-public-repo-for-the-stack.md`.
