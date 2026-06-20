/**
 * @file Viscosity unit definitions.
 *
 * @example
 * ```ts
 * import VISCOSITY from "@quantities/units/viscosity";
 * import { poise, stokes } from "@quantities/units/viscosity";
 * ```
 */

import type { UnitEntry } from "@quantities/core";

export const poise: UnitEntry = {
	key: "<poise>",
	aliases: ["P", "poise"],
	scalar: 0.1,
	kind: "viscosity",
	numerator: ["<pascal>", "<second>"],
};

export const stokes: UnitEntry = {
	key: "<stokes>",
	aliases: ["St", "stokes"],
	scalar: 1e-4,
	kind: "viscosity",
	numerator: ["<meter>", "<meter>"],
	denominator: ["<second>"],
};

export default [poise, stokes];
