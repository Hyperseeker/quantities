/**
 * @file Area unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Area units.
 */
export const AREA = {
	"<hectare>": [
		["hectare", "ha"],
		1,
		"area",
		["<hecto>", "<meter>", "<hecto>", "<meter>"],
	],

	"<sqft>": [["sqft"], 1, "area", ["<foot>", "<foot>"]],
	"<acre>": [["acre", "acres"], 43_560, "area", ["<foot>", "<foot>"]],
} as const satisfies UnitMap;
