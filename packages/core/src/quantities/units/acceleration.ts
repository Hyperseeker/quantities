/**
 * @file Acceleration unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Acceleration units.
 */
export const ACCELERATION = {
	"<gee>": [
		["gee"],
		9.80665,
		"acceleration",
		["<meter>"],
		["<second>", "<second>"],
	],
} as const satisfies UnitMap;
