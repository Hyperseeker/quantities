/**
 * @file Frequency unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Frequency units.
 */
export const FREQUENCY = {
	"<hertz>": [
		["Hz", "hertz", "Hertz"],
		1.0,
		"frequency",
		["<1>"],
		["<second>"],
	],
} as const satisfies UnitMap;
