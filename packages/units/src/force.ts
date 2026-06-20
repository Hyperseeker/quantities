/**
 * @file Force unit definitions.
 *
 * @example
 * ```ts
 * import FORCE from "@quantities/units/force";
 * import { dyne, gramForce } from "@quantities/units/force";
 * ```
 */

import type { UnitEntry } from "@quantities/core";

export const dyne: UnitEntry = {
	key: "<dyne>",
	aliases: ["dyn", "dyne"],
	scalar: 1,
	kind: "force",
	numerator: ["<gram>", "<centi>", "<meter>"],
	denominator: ["<second>", "<second>"],
};

export const gramForce: UnitEntry = {
	key: "<gram-force>",
	aliases: ["gf", "gram-force"],
	scalar: 9.80665,
	kind: "force",
	numerator: ["<milli>", "<newton>"],
};

export default [dyne, gramForce];
