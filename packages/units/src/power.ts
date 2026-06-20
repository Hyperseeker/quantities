/**
 * @file Power unit definitions.
 *
 * @example
 * ```ts
 * import POWER from "@quantities/units/power";
 * import { voltAmpereReactive } from "@quantities/units/power";
 * ```
 */

import type { UnitEntry } from "@quantities/core";

export const voltAmpereReactive: UnitEntry = {
	key: "<volt-ampere-reactive>",
	aliases: ["var", "Var", "VAr", "VAR", "volt-ampere-reactive"],
	scalar: 1.0,
	kind: "power",
	numerator: ["<volt>", "<ampere>"],
};

export default [voltAmpereReactive];
