# @quantities/core

## 2.0.0 / 2026-06-20

Complete TypeScript rewrite and extensive refactor.

- Converted library to a monorepo for plugin development

### Added

#### Static methods

- `Quantity.min()`: from the provided strings, quantities, or numbers, return the smallest one as a quantity
    - Units of the winning quantity are preserved in the returned `Quantity` object
    - Example: `Quantity.min("2 m", Quantity("3 m"), "50 cm")` → `Quantity("50 cm")`
- `Quantity.max()`: from the provided strings, quantities, or numbers, return the largest one as a quantity
    - Units of the winning quantity are preserved in the returned `Quantity` object
    - Example: `Quantity.max("10 hours", Quantity("720 min"), Quantity("36000 s"))` → `Quantity("720 min")`

#### Instance methods

- `sign()`: like `Math.sign()`, it returns
    - `-1` if the quantity's scalar is negative
    - `0` if zero
    - `1` is positive
    - Example: `Quantity("-2 s").sign()` → `-1`
    - Example: `Quantity(0).sign()` → `0`
    - Example: `Quantity("25 Hz").sign()` → `1`
- `abs()`: like `Math.abs()`, it returns the absolute (unsigned) value of the quantity's scalar, with the unit intact
    - Example: `Quantity("25 m").abs()` → `Quantity("25 m")`
    - Example: `Quantity("-100 s").abs()` → `Quantity("100 s")`

#### Aliases for existing instance methods

- `equals()` for `eq()`
- `lessThan()` for `lt()`
- `greaterThan()` for `gt()`
- `lessThanOrEqual()` for `lte()`
- `greaterThanOrEqual()` for `gte()`
- `compare()` for `compareTo()`

#### Missing aliases

- `cent` for `<cents>`
- `dollars` for `<dollar>`
- `ha` for `<hectare>`
- `pixels` for `<pixel>`
- `lyr` for `<light-year>` (see: <https://doi.org/10.1038%2F294236a0>)
- `rotations` for `<rotation>`

#### Unit registries

Units are now handled via a swappable registry system. `@quantities/core` bundles a default registry that almost entirely replicates the units from v1.8 of `js-quantities`, so the default `Quantity`'s behavior is unchanged. Custom, augmented, and isolated registries are provided by `@quantities/registry`. See the package itself for more information.

#### Rounding error fixing

Safe-math operations now correct floating-point noise (e.g. the infamous `0.1 + 0.2 === 0.30000000000000004`) during the library's calculations. (See: [rounding error fixing](./.changelog/v2.0.0/rounding-error-fixing.md).)

#### Exponents and roots

`Quantity` instances can be raised to a power with `.pow()` (alias `.exponent()`) and have their roots extracted with `.root()` (`.sqrt()`/`.cbrt()` as shorthands). (See: [exponents-and-roots.md](./.changelog/v2.0.0/exponents-and-roots.md).)

#### Compound input

Quantities now accept multi-unit string inputs for compatible units, such as `6 ft 4 in` or `1 hour 30 minutes`. (See: [compound-input.md](./.changelog/v2.0.0/compound-input.md).)

### Fixed

- Unit multiplication now always prefers the smallest unit
    - Example: `Quantity("1 km").multiply("1 mm")` → `Quantity("1000000 mm2")`

#### Inconsistent unit definitions

- `<sqft>` used to be defined with a metric scalar (`0.09290304`, as in `1 sqft` = `0.09290304 m^2`) but imperial units (numerator: `["foot", "foot"]`, i.e. feet squared); it is now defined as simply `1 ft^2`: scalar `1`, numerator `["foot", "foot"]`

### Removed

#### Units

- `<kph>`, `<mph>`, `<fps>`, `<bps>`, `<Bps>`: they served as inline shortcuts for simple unit combinations, with no obvious advantage to using them over their simple counterparts; supporting them feels unnecessary in absence of clear value
    - these can be re-enabled on the user end with a custom registry

#### Colliding aliases

Two units in the default registry had colliding aliases: that is, they could have been referenced with the same unit in the quantity string. `3 pt` could've been interpreted as 3 pints or 3 points. This lead to several cases of inconsistent results when creating or modifying a quantity, something that could not have been rectified on the user's end.

- `pt` removed from `<pint>`: collides with `<point>`
- `gr` removed from `<gross>`: collides with `<grain>`

These aliases can be added back via `@quantities/registry` by redefining the unit with the alias included and passing it to `createRegistry()` (entries override existing units by key): `createRegistry({ /* unit definition incl. the alias */ })`

### Changed

#### Non-metric unit definitions

Imperial and US customary units have been redefined in relation to their respective common units (e.g. the US gallon as `inch^3`, pints and quarts relative to their gallons). The change is presentational; metric conversions remain consistent. (See: [non-metric-unit-definitions.md](./.changelog/v2.0.0/non-metric-unit-definitions.md).)

#### Kilogram → gram as base weight

The base unit of weight is now `<gram>` rather than `<kilogram>`, for consistent prefix handling. `kg` is now parsed as `<kilo>, <gram>`, which is exactly 1000 grams. (See: [kilogram-to-gram.md](./.changelog/v2.0.0/kilogram-to-gram.md).)

#### Spec broken down into individual tests

Breaking down a single spec into a collection of narrow, individual groups of tests makes test development easier. Shorter test files are quicker to assess, edit, and rearrange.

#### `L` as the primary alias for the liter

We follow the [NIST preference](https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-5-units-outside-si#table6) for the symbol `L` for liters: it is less ambiguous than `l` (some monoscaped fonts may make it and `1` [one] look similar enough). `l` is still a valid alias for the liter: `1 L` === `1 l`. The only difference is the default choice of units for output: i.e. `1000 ml`, when converted to liters, will become `1 L`, not `1 l`.

## 1.8.0 / 2023-08-21

### Added

- Add "Joules" alias
- Add some parts-per notation units
- Add metric ton symbol t
- Add electronvolt
- Add arcminute and arcsecond

### Fixed

- Fix wrong quantity name for molar_concentration units

## 1.7.6 / 2020-12-06

### Added

- Unit of acceleration `Gal`

### Fixed

- Missing aliases for barrel-related units (#101)

## 1.7.5 / 2020-04-05

- Update development dependencies
- Use ESLint as linter

## 1.7.4 / 2019-06-26

- Add Imperial Gallons, and Barrels (US Beer, Imperial Beer, Oil)
- Add support for imperial version of fluid ounces and pints

## 1.7.3 / 2018-12-15

- Fix some inconsistent resulting units when multiplying or dividing
  quantities (#94)

## 1.7.2 / 2018-03-31

- Remove `module` from package definition (Fix #91)

## 1.7.1 / 2018-03-25

- Add missing unit aliases

## 1.7.0 / 2017-08-23

- Fix JS allocation failure for unrealistically large exponents
- Add volt-ampere, volt-ampere-reactive and data mile definitions
- Add redshift alias

## 1.6.6 / 2017-02-08

- Report incompatible units in error message

## 1.6.5 / 2017-01-20

- Fix main entrypoint in bower.json

## 1.6.4 / 2017-01-02

- Fix infinite regex check

## 1.6.3 / 2016-09-22

- Add missing kinds
- Fix conversion from percentage to unitless quantity
- Fix capacitance definition
- Exclude `farad` from base units
- Rename `mass concentration` to `density`

## 1.6.2 / 2016-04-13

- Accept blank string as initialization value

## 1.6.1 / 2016-03-27

- Fix definition of square foot
- Add tablespoon `tbsp` alias
- Add `Qty.version` property

## 1.6.0 / 2015-12-26

- Add `Qty.getUnits` to return available units of a well-known kind
- Add `Qty.getAliases` to return every alias of a specific unit
- Allow to initialize a quantity with scalar and units as separate arguments
- Rename `memory` kind to `information`
- Add `information_rate` kind
- Accept Wh and Ah as units
- Fix hang when using water height pressure units
- Add plural for fluid ounce
- Fix `amu` and `dalton` definitions
- Add `tb` as tablespoon alias
- Add plural for `information` units
- Minor fixes or improvements

## 1.5.0 / 2014-12-08

- Add `Qty.getKinds` returning known kinds of units
- Add µ symbol as micro prefix alias
- Add Ω symbol as ohm unit alias
- Minor internal improvements and fixes

## 1.4.2 / 2014-09-09

- Fix plural for radian and add missing ones for time units
- Add "gon" international standard symbol as gradian alias
- Fix units of force
- Allow whitespaces between sign and scalar and do not accept sign
  without scalar

## 1.4.1 / 2014-05-14

- Use a little more robust to test string type and factorize it

## 1.4.0 / 2014-04-10

- Directly convert array of values when using swiftConverter
- Add support for bushel units

## 1.3.0 / 2014-03-05

- Add Qty#format and accept custom formatters
- Allow to call Qty() without new to create Qty instances (Qty could be used
  both as a constructor or as a factory)
- Qty#toString only supports to be passed output units as single parameter.
  Former parameters are now deprecated but still supported to not introduce
  a breaking change
- Add mc as alternate definition for prefix "micro"
- Throw error with mmm as unit
- Add rounding optimization

## 1.2.0 / 2013-12-17

- Throw QtyError instead of plain string
- Cache conversion results from Qty#to instead of Qty#toString
- Fix point and pica unit definitions
- Fix error when initializing a quantity with an empty string

## 1.1.2 / 2013-11-04

- Fix rounding issue when converting 1 cm3 to mm3
- Do some code cleaning (it should not break public API)

## 1.1.1 / 2013-10-01

- Fix Qty#toPrec() returning wrong result with some precision

## 1.1.0 / 2013-09-20

- Add array converting method
- Major speedup by means of some optimizations and refactoring

## 1.0.0 / 2013-07-30

- First stable version
