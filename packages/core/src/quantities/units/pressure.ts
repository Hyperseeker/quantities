/**
 * @file Pressure unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Pressure units.
 */
export const PRESSURE = {
	"<pascal>": [
		["Pa", "pascal", "Pascal"],
		1.0,
		"pressure",
		["<kilo>", "<gram>"],
		["<meter>", "<second>", "<second>"],
	],
	"<bar>": [["bar", "bars"], 100, "pressure", ["<kilo>", "<pascal>"]],
	"<mmHg>": [["mmHg"], 133.322_387_415, "pressure", ["<pascal>"]],
	"<inHg>": [["inHg"], 3_386.388_147_2, "pressure", ["<pascal>"]],
	"<atm>": [
		["atm", "ATM", "atmosphere", "atmospheres"],
		101_325,
		"pressure",
		["<pascal>"],
	],
	"<torr>": [["torr"], 0.0013157895, "pressure", ["<atm>"]],
	"<psi>": [["psi"], 1, "pressure", ["<pound-force>"], ["<inch>", "<inch>"]],
} as const satisfies UnitMap;
