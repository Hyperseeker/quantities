# Compound string output

Quantities can output strings formatted as a collection of the quantity's constituent units: for example, `1.5 hours` can be output as `1 hour 30 minutes`. To enable:

```ts
import Quantity from "@quantities/core";
import toCompound from "@quantities/to-compound";

Quantity.extend(toCompound);
```

`Quantity(value).toCompound()` outputs a string with the most appropriate units chosen for the given quantity: `Quantity("1200 g").toCompound()` → `"1 kg 200 g"`.

You can specify the desired units as the first argument: `Quantity("1020.56 g").toCompound(["kg", "mg"])` → `"1 kg 20560 mg"`. By default, the function selects up to three most appropriate units. Specifying more than three units in the first argument will allow outputting with more units. Provided units must be compatible with the source quantity's (i.e. you cannot specify hours and minutes on a length).

Empty units (those with scalar of 0) are skipped on output: `Quantity("1000 g").toCompound()` → `"1 kg"`. Quantities where the full scalar of all units is zero are output as such: `Quantity("0 g").toCompound()` → `"0 g"`. (See `Options` on how to handle this differently.)

## Options

An options object can be passed as the second argument (after the target units, which may be `undefined` to keep automatic unit selection):

```ts
Quantity("1000 g").toCompound(["kg", "g"], { skipZeros: false }); // → "1 kg 0 g"
Quantity("1500000 g").toCompound(undefined, { step: 6 }); // → "1 Mg 500000 g"
```

- `skipZeros` (default `true`): skip components whose scalar is 0. Set to `false` to output every unit, including zero-scalar ones: `Quantity("1000 g").toCompound(["kg", "g"], { skipZeros: false })` → `"1 kg 0 g"`.
- `precision`: maximum number of decimals for the smallest component. `Quantity("1.23456 m").toCompound(["m", "cm"], { precision: 1 })` → `"1 m 23.5 cm"` (otherwise → `"1 m 23.456 cm"`).
- `step` (default `3`): exponent step between auto-selected SI prefix tiers. `Quantity("1500000 g").toCompound()` → `"1 Mg 500 kg"`, while `{ step: 6 }` skips from mega straight to base → `"1 Mg 500000 g"`.
- `threshold` (default `0`): minimum absolute value for a component to be included, useful for dropping tiny remainders. `Quantity("1000.4 g").toCompound(["kg", "g"], { threshold: 1 })` → `"1 kg"` (otherwise → `"1 kg 0.4 g"`).
- `formatter`: custom `(scalar, units) => string` formatter applied to each component. `Quantity("1200 g").toCompound(undefined, { formatter: (value, unit) => `${value}${unit}` })` → `"1kg 200g"`.
