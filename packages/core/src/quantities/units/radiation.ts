/**
 * @file Radiation unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Radiation units.
 */
export const RADIATION = {
	"<gray>": [
		["Gy", "gray", "grays"],
		1.0,
		"radiation",
		["<meter>", "<meter>"],
		["<second>", "<second>"],
	],
	"<sievert>": [
		["Sv", "sievert", "sieverts"],
		1.0,
		"radiation",
		["<meter>", "<meter>"],
		["<second>", "<second>"],
	],
	"<becquerel>": [
		["Bq", "becquerel", "becquerels"],
		1.0,
		"radiation",
		["<1>"],
		["<second>"],
	],
} as const satisfies UnitMap;
