/**
 * @file Inductance unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Inductance units.
 */
export const INDUCTANCE = {
	"<henry>": [
		["H", "Henry", "henry"],
		1.0,
		"inductance",
		["<meter>", "<meter>", "<kilo>", "<gram>"],
		["<second>", "<second>", "<ampere>", "<ampere>"],
	],
} as const satisfies UnitMap;
