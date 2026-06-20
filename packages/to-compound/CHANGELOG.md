# @quantities/to-compound

## 0.5.0 / 2026-06-20

Initial release.

### Added

- `.toCompound()`: format a quantity as a collection of its constituent units — e.g. `Quantity("1200 g").toCompound()` → `"1 kg 200 g"`.
- Pass desired units as the first argument: `Quantity("1020.56 g").toCompound(["kg", "mg"])` → `"1 kg 20560 mg"`. Up to three units are chosen by default; supplying more than three in the argument allows more. Units must be compatible with the quantity's.
- Empty units (scalar 0) are skipped: `Quantity("1000 g").toCompound()` → `"1 kg"`. An all-zero quantity outputs as `Quantity("0 g").toCompound()` → `"0 g"`.

See [compound-output.md](./.changelog/v0.5.0/compound-output.md) for the full description.
