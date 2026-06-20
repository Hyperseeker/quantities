/**
 * @file Barrel export for every unit and group.
 *
 * @example
 * ```ts
 * import ALL from "@quantities/units";
 * import { LENGTH } from "@quantities/units";
 * import { league } from "@quantities/units";
 * ```
 */

import ACCELERATION from "./acceleration.ts";
import ACTIVITY from "./activity.ts";
import ANGLE from "./angle.ts";
import CHARGE from "./charge.ts";
import COUNTING from "./counting.ts";
import CURRENT from "./current.ts";
import ENERGY from "./energy.ts";
import FORCE from "./force.ts";
import LENGTH from "./length.ts";
import MAGNETISM from "./magnetism.ts";
import MASS from "./mass.ts";
import MOLAR_CONCENTRATION from "./molar_concentration.ts";
import POWER from "./power.ts";
import PREFIX from "./prefix.ts";
import PREFIX_ONLY from "./prefix_only.ts";
import PRESSURE from "./pressure.ts";
import RADIATION from "./radiation.ts";
import RATE from "./rate.ts";
import SPEED from "./speed.ts";
import TEMPERATURE from "./temperature.ts";
import TIME from "./time.ts";
import VISCOSITY from "./viscosity.ts";
import VOLUME from "./volume.ts";

export * from "./acceleration.ts";
export * from "./activity.ts";
export * from "./angle.ts";
export * from "./charge.ts";
export * from "./counting.ts";
export * from "./current.ts";
export * from "./energy.ts";
export * from "./force.ts";
export * from "./length.ts";
export * from "./magnetism.ts";
export * from "./mass.ts";
export * from "./molar_concentration.ts";
export * from "./power.ts";
export * from "./prefix.ts";
export * from "./prefix_only.ts";
export * from "./pressure.ts";
export * from "./radiation.ts";
export * from "./rate.ts";
export * from "./speed.ts";
export * from "./temperature.ts";
export * from "./time.ts";
export * from "./viscosity.ts";
export * from "./volume.ts";

export {
	ACCELERATION,
	ACTIVITY,
	ANGLE,
	CHARGE,
	COUNTING,
	CURRENT,
	ENERGY,
	FORCE,
	LENGTH,
	MAGNETISM,
	MASS,
	MOLAR_CONCENTRATION,
	POWER,
	PREFIX,
	PREFIX_ONLY,
	PRESSURE,
	RADIATION,
	RATE,
	SPEED,
	TEMPERATURE,
	TIME,
	VISCOSITY,
	VOLUME,
};

export default [
	...ACCELERATION,
	...ACTIVITY,
	...ANGLE,
	...CHARGE,
	...COUNTING,
	...CURRENT,
	...ENERGY,
	...FORCE,
	...LENGTH,
	...MAGNETISM,
	...MASS,
	...MOLAR_CONCENTRATION,
	...POWER,
	...PREFIX,
	...PREFIX_ONLY,
	...PRESSURE,
	...RADIATION,
	...RATE,
	...SPEED,
	...TEMPERATURE,
	...TIME,
	...VISCOSITY,
	...VOLUME,
];
