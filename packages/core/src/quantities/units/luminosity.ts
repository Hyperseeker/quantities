/**
 * @file Luminosity unit definitions, including luminous power and illuminance.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Luminosity units.
 */
export const LUMINOSITY = {
	"<candela>": [["cd", "candela"], 1.0, "luminosity", ["<candela>"]],
	"<lumen>": [
		["lm", "lumen"],
		1.0,
		"luminous_power",
		["<candela>", "<steradian>"],
	],
	"<lux>": [["lux"], 1.0, "illuminance", ["<lumen>"], ["<meter>", "<meter>"]],
} as const satisfies UnitMap;
