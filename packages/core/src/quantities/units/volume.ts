/**
 * @file Volume unit definitions: metric, imperial, and US.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Volume units.
 */
export const VOLUME = {
	// * metric volumes
	"<liter>": [
		["L", "l", "liter", "liters", "litre", "litres"],
		0.001,
		"volume",
		["<meter>", "<meter>", "<meter>"],
	],

	// * imperial volumes
	"<gallon-imp>": [
		["galimp", "gallon-imp", "gallons-imp"],
		4.54609,
		"volume",
		["<liter>"],
	],
	"<pint-imp>": [
		["ptimp", "pint-imp", "pints-imp"],
		0.125,
		"volume",
		["<gallon-imp>"],
	],
	"<fluid-ounce-imp>": [
		["flozimp", "floz-imp", "fluid-ounce-imp", "fluid-ounces-imp"],
		0.00625,
		"volume",
		["<gallon-imp>"],
	],

	// * US volumes
	"<gallon>": [
		["gal", "gallon", "gallons"],
		231,
		"volume",
		["<inch>", "<inch>", "<inch>"],
	],
	"<quart>": [["qt", "quart", "quarts"], 0.25, "volume", ["<gallon>"]],
	"<pint>": [["pint", "pints"], 0.125, "volume", ["<gallon>"]],
	"<cup>": [["cu", "cup", "cups"], 0.0625, "volume", ["<gallon>"]],
	"<fluid-ounce>": [
		["floz", "fluid-ounce", "fluid-ounces"],
		0.0078125,
		"volume",
		["<gallon>"],
	],
	"<tablespoon>": [
		["tb", "tbsp", "tbs", "tablespoon", "tablespoons"],
		0.5,
		"volume",
		["<fluid-ounce>"],
	],
	"<teaspoon>": [
		["tsp", "teaspoon", "teaspoons"],
		0.1666666667,
		"volume",
		["<fluid-ounce>"],
	],
} as const satisfies UnitMap;
