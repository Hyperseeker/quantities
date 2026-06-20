/**
 * @file Barrel assembling every per-kind unit map into the master `UNITS`, alongside the shared unity and base-unit definitions.
 */

import type { UnitMap } from "../types.ts";
import { PREFIXES } from "./units/prefixes.ts";
import { LENGTHS } from "./units/lengths.ts";
import { MASS } from "./units/mass.ts";
import { AREA } from "./units/area.ts";
import { VOLUME } from "./units/volume.ts";
import { SPEED } from "./units/speed.ts";
import { ACCELERATION } from "./units/acceleration.ts";
import { TEMPERATURE } from "./units/temperature.ts";
import { TIME } from "./units/time.ts";
import { PRESSURE } from "./units/pressure.ts";
import { SUBSTANCE } from "./units/substance.ts";
import { MOLAR_CONCENTRATION } from "./units/molar-concentration.ts";
import { CAPACITANCE } from "./units/capacitance.ts";
import { CHARGE } from "./units/charge.ts";
import { CURRENT } from "./units/current.ts";
import { CONDUCTANCE } from "./units/conductance.ts";
import { INDUCTANCE } from "./units/inductance.ts";
import { POTENTIAL } from "./units/potential.ts";
import { RESISTANCE } from "./units/resistance.ts";
import { MAGNETISM } from "./units/magnetism.ts";
import { ENERGY } from "./units/energy.ts";
import { FORCE } from "./units/force.ts";
import { FREQUENCY } from "./units/frequency.ts";
import { ANGLE } from "./units/angle.ts";
import { ROTATION } from "./units/rotation.ts";
import { INFORMATION } from "./units/information.ts";
import { CURRENCY } from "./units/currency.ts";
import { LUMINOSITY } from "./units/luminosity.ts";
import { POWER } from "./units/power.ts";
import { RADIATION } from "./units/radiation.ts";
import { RATE } from "./units/rate.ts";
import { RESOLUTION } from "./units/resolution.ts";
import { TYPOGRAPHY } from "./units/typography.ts";
import { COUNTING } from "./units/counting.ts";
import { PREFIX_ONLY } from "./units/prefix-only.ts";
import { LOGARITHMIC } from "./units/logarithmic.ts";

/**
 * Internal name of the unit. Used as both a key to the units object and as a way to reference numerators and denominators.
 */
export type UnitKey = keyof typeof UNITS;

/**
 * Internal name of an SI base unit.
 */
export type SIBaseUnitKey = (typeof SI_BASE_UNITS)[number];

/**
 * Internal name of any base unit.
 */
export type BaseUnitKey = (typeof BASE_UNITS)[number];

/**
 * Internal name of the dimensionless unit.
 */
export const UNITY = "<1>" as const;

/**
 * Single-element term standing in for a dimensionless numerator or denominator.
 */
export const UNITY_ARRAY = [UNITY] as const;

/**
 * Every known unit, keyed by internal name, assembled from the per-kind maps in `./units/`.
 */
export const UNITS = {
	...PREFIXES,
	...LENGTHS,
	...MASS,
	...AREA,
	...VOLUME,
	...SPEED,
	...ACCELERATION,
	...TEMPERATURE,
	...TIME,
	...PRESSURE,
	...SUBSTANCE,
	...MOLAR_CONCENTRATION,
	...CAPACITANCE,
	...CHARGE,
	...CURRENT,
	...CONDUCTANCE,
	...INDUCTANCE,
	...POTENTIAL,
	...RESISTANCE,
	...MAGNETISM,
	...ENERGY,
	...FORCE,
	...FREQUENCY,
	...ANGLE,
	...ROTATION,
	...INFORMATION,
	...CURRENCY,
	...LUMINOSITY,
	...POWER,
	...RADIATION,
	...RATE,
	...RESOLUTION,
	...TYPOGRAPHY,
	...COUNTING,
	...PREFIX_ONLY,
	...LOGARITHMIC,

	"<1>": [["1", "<1>"], 1, ""],
} as const satisfies UnitMap;

/**
 * The seven SI base units.
 */
export const SI_BASE_UNITS = [
	"<meter>",
	"<gram>",
	"<second>",
	"<mole>",
	"<ampere>",
	"<kelvin>",
	"<candela>",
] as const;

/**
 * Every base unit: the SI base units plus the non-SI bases this library reduces other units to.
 */
export const BASE_UNITS = [
	...SI_BASE_UNITS,
	"<radian>",
	"<temp-K>",
	"<byte>",
	"<dollar>",
	"<each>",
	"<steradian>",
	"<decibel>",
] as const;
