# @quantities/registry

Custom unit registries for `@quantities/core`. Define your own units and prefixes, then get a `Quantity` constructor bound to them.

## Install

```sh
npm install @quantities/registry
bun add @quantities/registry
```

## Defining units

A unit is a `UnitEntry` (type from `@quantities/core`). `numerator` references the base unit(s) it derives from; omit it to declare a new base unit.

```ts
import type { UnitEntry } from "@quantities/core";

const cubit: UnitEntry = {
	key: "<cubit>",
	aliases: ["cubit", "cubits"],
	scalar: 0.4572,
	kind: "length",
	numerator: ["<meter>"],
};
```

## Building a registry

`createRegistry(units?, source?)` returns a new `UnitRegistry`. It accepts a single entry, an array, or an array of arrays. By default it extends core's `DEFAULT_REGISTRY`; pass `null` as `source` to start from an empty registry.

```ts
import { createRegistry, withRegistry } from "@quantities/registry";

const registry = createRegistry(cubit); // core units + cubit
```

`withRegistry(registry)` returns a `Quantity` constructor (plus `getUnits` / `getAliases` helpers) scoped to that registry. Destructure `default` to name it:

```ts
const { default: Quantity, getUnits } = withRegistry(registry);

Quantity("2 cubits").to("m").format(); // → "0.9144 m"
getUnits("length"); // → includes "cubit"
```

Quantities from different registries cannot interoperate — operate only within the constructor returned by `withRegistry`.

## Adding prefixes

A prefix is just a `UnitEntry` with `kind: "prefix"` and no decomposition — pass it to `createRegistry` exactly like any unit:

```ts
const withGoogol = createRegistry(
	{
		key: "<googol>",
		aliases: ["googol"],
		scalar: 1e100,
		kind: "prefix",
	},
	registry,
);
```

## Validation

Entries are validated automatically when added (scalars, references, alias collisions, and dependency cycles). The individual validators are also exported for standalone use:

```ts
import {
	validateUnitEntry,
	validatePrefixEntry,
	validateScalar,
	validateReferences,
	checkUnitAliasCollisions,
	checkPrefixAliasCollisions,
	detectCycles,
} from "@quantities/registry";
```

## Specialized units

`@quantities/units` provides ready-made, kind-grouped definitions you can pass straight to `createRegistry`.

## License

MIT
