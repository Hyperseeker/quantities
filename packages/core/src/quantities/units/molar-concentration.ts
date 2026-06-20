/**
 * @file Molar concentration unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Molar concentration units.
 */
export const MOLAR_CONCENTRATION = {
	"<molar>": [
		["M", "molar"],
		1,
		"molar_concentration",
		["<mole>"],
		["<liter>"],
	],
} as const satisfies UnitMap;
