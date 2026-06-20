/**
 * @file Radiation unit definitions.
 *
 * @example
 * ```ts
 * import RADIATION from "@quantities/units/radiation";
 * import { roentgen, curie } from "@quantities/units/radiation";
 * ```
 */

import type { UnitEntry } from "@quantities/core";

export const roentgen: UnitEntry = {
	key: "<roentgen>",
	aliases: ["R", "roentgen"],
	scalar: 0.00258,
	kind: "radiation",
	numerator: ["<coulomb>"],
	denominator: ["<kilo>", "<gram>"],
};

export const curie: UnitEntry = {
	key: "<curie>",
	aliases: ["Ci", "curie", "curies"],
	scalar: 37,
	kind: "radiation",
	numerator: ["<giga>", "<becquerel>"],
};

export default [roentgen, curie];
