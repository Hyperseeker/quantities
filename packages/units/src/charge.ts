/**
 * @file Electric charge unit definitions.
 *
 * @example
 * ```ts
 * import CHARGE from "@quantities/units/charge";
 * import { elementaryCharge } from "@quantities/units/charge";
 * ```
 */

import type { UnitEntry } from "@quantities/core";

export const elementaryCharge: UnitEntry = {
	key: "<elementary-charge>",
	aliases: ["e"],
	scalar: 1.602_176_634e-19,
	kind: "charge",
	numerator: ["<coulomb>"],
};

export default [elementaryCharge];
