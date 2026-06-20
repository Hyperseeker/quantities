/**
 * @file Temperature unit definitions.
 *
 * @example
 * ```ts
 * import TEMPERATURE from "@quantities/units/temperature";
 * import { rankine, tempR } from "@quantities/units/temperature";
 * ```
 */

import type { UnitEntry } from "@quantities/core";

export const rankine: UnitEntry = {
	key: "<rankine>",
	aliases: ["degR", "\u00B0R", "°R", "rankine"],
	scalar: 5 / 9,
	kind: "temperature",
	numerator: ["<kelvin>"],
};

export const tempR: UnitEntry = {
	key: "<temp-R>",
	aliases: ["tempR", "temp-R"],
	scalar: 5 / 9,
	kind: "temperature",
	numerator: ["<temp-K>"],
};

export default [rankine, tempR];
