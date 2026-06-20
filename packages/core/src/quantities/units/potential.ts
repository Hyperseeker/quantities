/**
 * @file Electric potential unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Electric potential units.
 */
export const POTENTIAL = {
	"<volt>": [
		["V", "Volt", "volt", "volts"],
		1.0,
		"potential",
		["<kilo>", "<gram>", "<meter>", "<meter>"],
		["<second>", "<second>", "<second>", "<ampere>"],
	],
} as const satisfies UnitMap;
