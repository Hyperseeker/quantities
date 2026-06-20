/**
 * @file Energy unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Energy units.
 */
export const ENERGY = {
	"<joule>": [
		["J", "joule", "Joule", "joules", "Joules"],
		1.0,
		"energy",
		["<kilo>", "<gram>", "<meter>", "<meter>"],
		["<second>", "<second>"],
	],
	"<btu>": [
		// * specifically BTU IT
		["BTU", "btu", "BTUs"],
		// * `4.1868 × 453.59237 × 5/9`
		1055.05585262,
		"energy",
		["<joule>"],
	],
	"<calorie>": [["cal", "calorie", "calories"], 4.184, "energy", ["<joule>"]],
	"<Calorie>": [
		["Cal", "Calorie", "Calories"],
		4184.0,
		"energy",
		["<joule>"],
	],
	// * we must continue to define watt-hours as a separate unit because this form, without a space between, is the common one
	// * to remove this as a distinct unit would require refactoring the matching to allow no-separator units
	"<Wh>": [["Wh"], 1, "energy", ["<watt>", "<hour>"]],
} as const satisfies UnitMap;
