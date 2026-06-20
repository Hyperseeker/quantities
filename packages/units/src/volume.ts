/**
 * @file Volume unit definitions.
 *
 * Includes petroleum, trade, and cooking volume measures.
 *
 * @example
 * ```ts
 * import VOLUME from "@quantities/units/volume";
 * import { oilbarrel, bushel, tablespoonInt } from "@quantities/units/volume";
 * ```
 */

import type { UnitEntry } from "@quantities/core";

export const tablespoonInt: UnitEntry = {
	key: "<tablespoon-int>",
	aliases: [
		"tb-int",
		"tbsp-int",
		"tbs-int",
		"tablespoon-int",
		"tablespoons-int",
		"int-tablespoon",
		"int-tablespoons",
	],
	scalar: 15,
	kind: "volume",
	numerator: ["<milli>", "<liter>"],
};

export const teaspoonInt: UnitEntry = {
	key: "<teaspoon-int>",
	aliases: [
		"tsp-int",
		"teaspoon-int",
		"teaspoons-int",
		"int-teaspoon",
		"int-teaspoons",
	],
	scalar: 5,
	kind: "volume",
	numerator: ["<milli>", "<liter>"],
};

export const beerbarrelImp: UnitEntry = {
	key: "<beerbarrel-imp>",
	aliases: [
		"blimp",
		"bl-imp",
		"beerbarrel-imp",
		"beerbarrels-imp",
		"beer-barrel-imp",
		"beer-barrels-imp",
	],
	scalar: 36,
	kind: "volume",
	numerator: ["<gallon-imp>"],
};

export const bushel: UnitEntry = {
	key: "<bushel>",
	aliases: ["bu", "bsh", "bushel", "bushels"],
	scalar: 9.3091774892,
	kind: "volume",
	numerator: ["<gallon>"],
};

export const oilbarrel: UnitEntry = {
	key: "<oilbarrel>",
	aliases: ["bbl", "oilbarrel", "oilbarrels", "oil-barrel", "oil-barrels"],
	scalar: 42,
	kind: "volume",
	numerator: ["<gallon>"],
};

export const beerbarrel: UnitEntry = {
	key: "<beerbarrel>",
	aliases: [
		"bl",
		"bl-us",
		"beerbarrel",
		"beerbarrels",
		"beer-barrel",
		"beer-barrels",
	],
	scalar: 31.5,
	kind: "volume",
	numerator: ["<gallon>"],
};

export default [
	tablespoonInt,
	teaspoonInt,
	beerbarrelImp,
	bushel,
	oilbarrel,
	beerbarrel,
];
