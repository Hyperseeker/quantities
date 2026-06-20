# @quantities/units

## 1.0.0 / 2026-06-20

Initial release.

### Added

#### Units

- `<tablespoon-int>`: the international tablespoon, 15 mL
- `<teaspoon-int>`: the international teaspoon, 5 mL
- `<cee>`: the speed of light
- `<hubble-constant>`: the Hubble constant, aka H₀
- `<hubble-constant-70>`: the previous implied Hubble constant used to calculate `<redshift>`
- `<hubble-length>`: the Hubble length, aka the Hubble radius
- `<biot>`: non-SI unit of current
- `<abampere>`: non-SI unit of current (= 1 biot)

#### Aliases

- `Gs` for `<gauss>`
- `iwg` and `inAq` for `<inh2o>`

### Fixed

- `<gross>` is now defined as simply `1 dozen^2` (scalar `1`, numerator `["dozen", "dozen"]`) rather than carrying a pre-resolved scalar of `144`.

### Deprecated

#### `<redshift>` unit

`<redshift>` is deprecated and will be removed in the next major version. Its historical definition is incorrect: it computed a Hubble length (`d ≈ (c/H₀) × z`), not a redshift, which is a unitless ratio of wavelengths. In its place, `<hubble-length>` was added — the value `<redshift>` actually defines — calculated using Planck 2018 cosmology. (See: [redshift-deprecation.md](./.changelog/v1.0.0/redshift-deprecation.md).)
