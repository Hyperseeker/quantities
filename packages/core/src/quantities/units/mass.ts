/**
 * @file Mass unit definitions: metric and US/imperial.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Mass units.
 */
export const MASS = {
	// * metric mass
	"<gram>": [
		["g", "gram", "grams", "gramme", "grammes"],
		1.0,
		"mass",
		["<gram>"],
	],
	"<metric-ton>": [
		["t", "tonne", "metric-ton"],
		1000,
		"mass",
		["<kilo>", "<gram>"],
	],
	"<carat>": [["ct", "carat", "carats"], 200, "mass", ["<milli>", "<gram>"]],

	// * US mass
	"<pound>": [
		["lbs", "lb", "pound", "pounds", "#"],
		0.45359237,
		"mass",
		["<kilo>", "<gram>"],
	],
	"<short-ton>": [["tn", "ton", "short-ton"], 2000, "mass", ["<pound>"]],
	"<ounce>": [["oz", "ounce", "ounces"], 0.0625, "mass", ["<pound>"]],
	"<stone>": [["st", "stone", "stones"], 14, "mass", ["<pound>"]],
} as const satisfies UnitMap;
