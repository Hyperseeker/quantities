# @quantities/units

A set of uncommon or specialized unit definitions for `@quantities/core`.

Use with `@quantities/registry` to build a `Quantity` constructor that understands them. Once the units are registered, the same `Quantity` class will carry them everywhere.

## Install

```sh
npm install @quantities/units @quantities/registry
bun add @quantities/units @quantities/registry
```

## Importing

Everything is importable from the package root, so you needn't know which kind a unit belongs to. Individual units, kind groups (arrays of unit entries), and `ALL` (every unit) are named exports. Collections are spelled in uppercase to set them apart from lowercase units:

```ts
// import all units
import UNITS from "@quantities/units";
// import only length units
import { LENGTH } from "@quantities/units";
// import a single unit
import { league } from "@quantities/units";
```

Each kind is also a separate entry point. There, the default export is the whole kind, and named exports are individual units:

```ts
// import every length unit
import LENGTH from "@quantities/units/length";
// import specific units only
import { league, furlong } from "@quantities/units/length";
```

## Using with a registry

Pass the imported definitions to `createRegistry()`, then bind a constructor with `withRegistry()`:

```ts
import LENGTH from "@quantities/units/length";
import SPEED from "@quantities/units/speed";
import { createRegistry, withRegistry } from "@quantities/registry";

// LENGTH's hubbleLength references a speed unit, so register SPEED alongside it
const registry = createRegistry([LENGTH, SPEED]);
const { default: Quantity } = withRegistry(registry);

Quantity("3 leagues").to("km").format(); // → "14.484 km"
```

`createRegistry` accepts an array of arrays, so you can combine any kinds:

```ts
import PREFIX from "@quantities/units/prefix";

const registry = createRegistry([LENGTH, SPEED, PREFIX]); // adds "googol"
```

## Available kinds

Each kind (uppercase) lists the units importable under it.

- `ACCELERATION`
    - `gal`
- `ACTIVITY`
    - `katal`
    - `unit`
- `ANGLE`
    - `gradian`
- `CHARGE`
    - `elementaryCharge`
- `COUNTING`
    - `cell`
    - `basePair`
    - `nucleotide`
    - `molecule`
- `CURRENT`
    - `biot`
    - `abampere`
- `ENERGY`
    - `erg`
    - `thermUS`
    - `electronvolt`
- `FORCE`
    - `dyne`
    - `gramForce`
- `LENGTH`
    - `league`
    - `mil`
    - `furlong`
    - `rod`
    - `fathom`
    - `lightMinute`
    - `lightSecond`
    - `datamile`
    - `hubbleLength`
    - `redshift`
- `MAGNETISM`
    - `gauss`
    - `maxwell`
    - `oersted`
- `MASS`
    - `grain`
    - `slug`
    - `dram`
    - `dalton`
    - `amu`
- `MOLAR_CONCENTRATION`
    - `wtpercent`
- `POWER`
    - `voltAmpereReactive`
- `PREFIX`
    - `googol`
- `PREFIX_ONLY`
    - `ppt`
    - `ppq`
    - `gross`
- `PRESSURE`
    - `cmH2O`
    - `inH2O`
- `RADIATION`
    - `roentgen`
    - `curie`
- `RATE`
    - `cpm`
    - `dpm`
- `SPEED`
    - `cee`
    - `hubbleConstant`
    - `hubbleConstant70`
- `TEMPERATURE`
    - `rankine`
    - `tempR`
- `TIME`
    - `fortnight`
- `VISCOSITY`
    - `poise`
    - `stokes`
- `VOLUME`
    - `tablespoonInt`
    - `teaspoonInt`
    - `beerbarrelImp`
    - `bushel`
    - `oilbarrel`
    - `beerbarrel`

## License

MIT
