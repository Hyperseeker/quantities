/**
 * @file Speed unit definitions.
 *
 * Includes the speed of light and Hubble constant variants.
 *
 * @example
 * ```ts
 * import SPEED from "@quantities/units/speed";
 * import { cee, hubbleConstant } from "@quantities/units/speed";
 * ```
 */

import type { UnitEntry } from "@quantities/core";

export const cee: UnitEntry = {
	key: "<cee>",
	aliases: ["cee", "speed-of-light", "light-speed"],
	scalar: 299_792_458,
	kind: "speed",
	numerator: ["<meter>"],
	denominator: ["<second>"],
};

export const hubbleConstant: UnitEntry = {
	key: "<hubble-constant>",
	aliases: ["H-zero", "h-zero", "hubble-zero", "hubble-constant"],
	scalar: 67.4,
	kind: "speed",
	numerator: ["<kilo>", "<meter>"],
	denominator: ["<second>", "<mega>", "<parsec>"],
};

export const hubbleConstant70: UnitEntry = {
	key: "<hubble-constant-70>",
	aliases: ["H_70"],
	scalar: 70,
	kind: "speed",
	numerator: ["<kilo>", "<meter>"],
	denominator: ["<second>", "<mega>", "<parsec>"],
};

export default [cee, hubbleConstant, hubbleConstant70];
