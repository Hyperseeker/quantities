/**
 * @file Electric charge unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Electric charge units.
 */
export const CHARGE = {
	"<coulomb>": [
		["C", "coulomb", "Coulomb"],
		1.0,
		"charge",
		["<ampere>", "<second>"],
	],
	"<Ah>": [["Ah"], 1, "charge", ["<ampere>", "<hour>"]],
} as const satisfies UnitMap;
