# packages-product

**Product chrome** — shell today; future API client can live here. Not domain slices.

| Package | Role |
|---------|------|
| **`shell/`** | Site chrome layer (`@altafusion/shell`) — layouts, header/footer, shell composables |

**Future:** `api-types`, `api-client` (generated contracts + HTTP transport).

**Dependency rule:** may depend on `packages-fugue/*` and `packages-platform/*`. Must not depend on `packages-consumer/`. Fugue and platform must not import this bucket.

See [README.packages.md](../README.packages.md) for the full bucket layout.
