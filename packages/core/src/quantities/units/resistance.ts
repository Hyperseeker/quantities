/**
 * @file Electrical resistance unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Electrical resistance units.
 */
export const RESISTANCE = {
	"<ohm>": [
		["Ohm", "ohm", "\u03A9", "\u2126"],
		1.0,
		"resistance",
		["<meter>", "<meter>", "<kilo>", "<gram>"],
		["<second>", "<second>", "<second>", "<ampere>", "<ampere>"],
	],
} as const satisfies UnitMap;
