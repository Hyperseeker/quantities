# @quantities/to-compound

Compound string output for `@quantities/core`: render a quantity in a human-readable fashion, e.g. `"1 kg 200 g"` or `"6 ft 4 in"`.

## Install

```sh
npm install @quantities/to-compound
bun add @quantities/to-compound
```

## Setup

The default export is an extension. Register it with `Quantity.extend()` to add the `.toCompound()` method to the prototype:

```ts
import Quantity from "@quantities/core";
import toCompound from "@quantities/to-compound";

const Q = Quantity.extend(toCompound);
```

`extend()` mutates the prototype and returns the same constructor, so existing `Quantity` instances gain the method too — `Q` is just a convenient handle.

## Usage

Called with no arguments, it walks the quantity's unit family and picks metric prefix tiers automatically, attempting to produce the best representation of the quantity across at most 3 units:

```ts
Q("1200 g").toCompound(); // → "1 kg 200 g"
```

Pass an explicit list of target units to control the breakdown:

```ts
Q("1.5 h").toCompound(["h", "min"]); // → "1 h 30 min"
Q("1020.56 g").toCompound(["kg", "mg"]); // → "1 kg 20560 mg"
```

## Options

A second argument tunes the output:

```ts
Q("100 cm").toCompound(["m", "cm"], { skipZeros: false }); // → "1 m 0 cm"
```

| Option                  | Type        | Default             | Description                                                        |
| ----------------------- | ----------- | ------------------- | ------------------------------------------------------------------ |
| `skipZeros`             | `boolean`   | `true`              | Omit zero-valued components (the largest unit is kept if all zero) |
| `precision`             | `number`    | —                   | Max decimals on the smallest component                             |
| `threshold`             | `number`    | —                   | Drop components below this absolute value                          |
| `step`                  | `number`    | `3`                 | Exponent step between SI prefix tiers (e.g. kilo→mega)             |
| `metricPrefixPowerStep` | `1 \| 3`    | `3`                 | Prefix granularity used in automatic (no-target) mode              |
| `formatter`             | `Formatter` | `DEFAULT_FORMATTER` | Custom per-component formatter from core                           |

## License

MIT
