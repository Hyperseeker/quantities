/**
 * @file Angle unit definitions, including solid angle.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Angular units.
 */
export const ANGLE = {
	"<radian>": [["rad", "radian", "radians"], 1.0, "angle", ["<radian>"]],
	"<degree>": [
		["deg", "degree", "degrees"],
		Math.PI / 180.0,
		"angle",
		["<radian>"],
	],
	"<arcminute>": [
		["arcmin", "arcminute", "arcminutes", "moa", "MoA", "MOA"],
		1 / 60,
		"angle",
		["<degree>"],
	],
	"<arcsecond>": [
		["arcsec", "arcsecond", "arcseconds"],
		1 / 60,
		"angle",
		["<arcminute>"],
	],
	"<steradian>": [
		["sr", "steradian", "steradians"],
		1.0,
		"solid_angle",
		["<steradian>"],
	],
} as const satisfies UnitMap;
