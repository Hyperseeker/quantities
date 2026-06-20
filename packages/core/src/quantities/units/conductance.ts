/**
 * @file Electrical conductance unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Electrical conductance units.
 */
export const CONDUCTANCE = {
	"<siemens>": [
		["S", "Siemens", "siemens"],
		1.0,
		"conductance",
		["<1>"],
		["<ohm>"],
	],
} as const satisfies UnitMap;
