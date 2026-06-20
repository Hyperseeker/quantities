/**
 * @file Force unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Force units.
 */
export const FORCE = {
	"<newton>": [
		["N", "Newton", "newton"],
		1.0,
		"force",
		["<kilo>", "<gram>", "<meter>"],
		["<second>", "<second>"],
	],
	"<pound-force>": [
		["lbf", "pound-force"],
		32.1740485564304,
		"force",
		["<pound>", "<foot>"],
		["<second>", "<second>"],
	],
} as const satisfies UnitMap;
