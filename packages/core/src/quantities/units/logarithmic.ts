/**
 * @file Logarithmic unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Logarithmic units.
 */
export const LOGARITHMIC = {
	"<decibel>": [
		["dB", "decibel", "decibels"],
		1.0,
		"logarithmic",
		["<decibel>"],
	],
} as const satisfies UnitMap;
