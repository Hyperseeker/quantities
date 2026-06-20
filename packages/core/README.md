# `@quantities/core`

TypeScript library for quantity calculation and unit conversion.

## Install

```sh
npm install @quantities/core
bun add @quantities/core
```

## Creating quantities

The `Quantity` object can be called directly or created as a class instance:

```ts
new Quantity("1 m");
Quantity("1 m");
```

`Quantity` accepts a string, a number with units, or another quantity:

```ts
import Quantity from "@quantities/core";

const height = Quantity("6 ft 4 in"); // parsed string
const area = Quantity(1, "sqft"); // value + units
const alsoHeight = Quantity(height); // another quantity
```

For hot loops, the `QuantityClass` named export is faster because it skips the proxy overhead. Use it if raw performance matters to you:

```ts
import { QuantityClass } from "@quantities/core";

const quantity = new QuantityClass("1 m");
```

## Converting

```ts
Quantity("2500 m/h").to("ft/s"); // → Quantity("2.2783610382035575 ft/s")
Quantity("100 cm").toBase(); // → Quantity("1 m")
Quantity("96.5 cm").toPrecision("5 cm"); // → Quantity("95 cm")
```

For repeated conversions between the same units, build a reusable swift converter (much faster than `.to()` per call):

```ts
const toFahrenheit = Quantity.swiftConverter("tempC", "tempF");

toFahrenheit(20); // → 68
toFahrenheit([0, 100]); // → [32, 212]
```

## Output

```ts
Quantity(1, "sqft").to("m2").format(); // → "0.09290304 m2"
Quantity("6 ft 4 in").to("cm").toString(); // → "193.04 cm"
Quantity("2 m").scalar; // → 2 (numeric value, in current units)
Quantity(2).toFloat(); // → 2 (unitless quantities only)
```

Pass a custom formatter to `format()`, or a precision/units qualifier to `toString()`:

```ts
Quantity("1.234 m").toString("cm", 1); // → "123.4 cm"
Quantity("2 m").format((scalar, units) => `${scalar.toFixed(2)} ${units}`);
```

## Arithmetic

```ts
Quantity("2.5 m").add("3 cm"); // → Quantity("2.53 m")
Quantity("2.5 m").subtract("3 cm"); // → Quantity("2.47 m")
Quantity("2 m").multiply(3); // → Quantity("6 m")
Quantity("6 m").divide("2 s"); // → Quantity("3 m/s")
Quantity("2 m").pow(2); // → Quantity("4 m2")
Quantity("9 cm^2").root(2); // → Quantity("3 cm")
Quantity("8 m3").cbrt(); // → Quantity("2 m")
Quantity("1 m/s").inverse(); // → Quantity("1 s/m")
Quantity("-3 m").abs(); // → Quantity("3 m")
Quantity("-3 m").sign(); // → -1
```

Most have short aliases: `sub`, `mul`, `div`, `pow`/`exponent`, `invert`, `sqrt`/`cbrt`.

## Comparison

```ts
Quantity("100 cm").equals("1 m"); // → true
Quantity("1 m").lessThan("2 m"); // → true
Quantity("1 m").compareTo("2 m"); // → -1 (i.e. "less")
Quantity("1 m").isSame("1 m"); // → true (identical units, not just equal value)
Quantity("1 m").isSame("100 cm"); // → false

Quantity.min("10 hours", "720 min"); // → Quantity("10 hours")
Quantity.max(Quantity("5 m"), "3 m"); // → Quantity("5 m")
```

## Predicates & introspection

```ts
Quantity("1 m").isCompatible("1 ft"); // → true
Quantity("1 m/s").isInverse("1 s/m"); // → true
Quantity("1 m").units(); // → "m"
Quantity("1 m/s").kind(); // → "speed"

Quantity("20 tempC").isTemperature(); // → true
Quantity("1 m").isBase(); // → true
Quantity("5").isUnitless(); // → true

Quantity.getKinds(); // → ["...", ...]
Quantity.getUnits("length"); // → ["...", ...]
Quantity.getAliases("m"); // → ["...", ...]
```

## Custom units & registries

Core ships with the default unit registry. To add your own units or build an isolated registry, use `@quantities/registry`, and `@quantities/units` for ready-made specialized definitions.

## Extensions

Register extra instance methods on the prototype via `Quantity.extend()`. See `@quantities/to-compound` for compound output (`"1 kg 200 g"`).

## License

MIT
