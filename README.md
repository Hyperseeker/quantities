# `@quantities`

TypeScript library for quantity calculation and unit conversion.

This is the monorepo for the `@quantities` family of packages. The core package handles parsing, conversion, arithmetic, and comparison. The surrounding packages extend it with custom registries, specialized units, and compound output.

## Packages

### `@quantities/core`

The `Quantity` object parses, converts, and computes quantities and their outputs:

```ts
import Quantity from "@quantities/core";

Quantity("6 ft 4 in").to("cm").toString(); // → "193.04 cm"
Quantity("2500 m/h").to("ft/s"); // → Quantity("2.2783610382035575 ft/s")
Quantity("2.5 m").add("3 cm"); // → Quantity("2.53 m")
Quantity("100 cm").equals("1 m"); // → true
```

See [`@quantities/core`](packages/core) for more information.

### `@quantities/registry`

Define your own units, then bind a `Quantity` constructor scoped to them:

```ts
import type { UnitEntry } from "@quantities/core";
import { createRegistry, withRegistry } from "@quantities/registry";

// ↓ the unit to add to the registry
const cubit: UnitEntry = {
	key: "<cubit>",
	aliases: ["cubit", "cubits"],
	scalar: 0.4572,
	kind: "length",
	numerator: ["<meter>"],
};

// ↓ appends new unit to default ones
const registry = createRegistry(cubit);
// ↓ `default` is usable `Quantity` expanded with the new unit
const { default: Quantity } = withRegistry(registry);

Quantity("2 cubits").to("m").format(); // → "0.9144 m"
```

See [`@quantities/registry`](packages/registry) for more information.

### `@quantities/units`

Ready-made definitions for uncommon and specialized units which can be used via `@quantities/registry`:

```ts
// ↓ import the entire category of length units
import LENGTH from "@quantities/units/length";
import { createRegistry, withRegistry } from "@quantities/registry";

const { default: Quantity } = withRegistry(createRegistry(LENGTH));

Quantity("3 leagues").to("km").format(); // → "14.484 km"
```

See [`@quantities/units`](packages/units) for more information.

### `@quantities/to-compound`

An extension that renders a quantity across multiple units for human-readable output:

```ts
import Quantity from "@quantities/core";
import toCompound from "@quantities/to-compound";

// ↓ adds `.toCompound()` instance method to prototype
Quantity.extend(toCompound);

Quantity("1200 g").toCompound(); // → "1 kg 200 g"
```

See [`@quantities/to-compound`](packages/to-compound) for more information.

## Install

```sh
npm install @quantities/core
bun add @quantities/core
```

## License

MIT
