/**
 * @file Rate unit definitions.
 *
 * @example
 * ```ts
 * import RATE from "@quantities/units/rate";
 * import { cpm, dpm } from "@quantities/units/rate";
 * ```
 */

import type { UnitEntry } from "@quantities/core";

export const cpm: UnitEntry = {
	key: "<cpm>",
	aliases: ["cpm"],
	scalar: 1.0 / 60.0,
	kind: "rate",
	numerator: ["<count>"],
	denominator: ["<second>"],
};

export const dpm: UnitEntry = {
	key: "<dpm>",
	aliases: ["dpm"],
	scalar: 1.0 / 60.0,
	kind: "rate",
	numerator: ["<count>"],
	denominator: ["<second>"],
};

export default [cpm, dpm];
