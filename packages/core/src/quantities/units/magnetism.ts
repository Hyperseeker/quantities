/**
 * @file Magnetism unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Magnetic flux and flux-density units.
 */
export const MAGNETISM = {
	"<weber>": [
		["Wb", "weber", "webers"],
		1.0,
		"magnetism",
		["<volt>"],
		["<second>"],
	],
	"<tesla>": [
		["T", "tesla", "teslas"],
		1.0,
		"magnetism",
		["<newton>", "<second>"],
		["<coulomb>", "<meter>"],
	],
} as const satisfies UnitMap;
