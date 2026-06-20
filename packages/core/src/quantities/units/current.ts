/**
 * @file Electric current unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Electric current units.
 */
export const CURRENT = {
	"<ampere>": [
		["A", "Ampere", "ampere", "amp", "amps"],
		1.0,
		"current",
		["<ampere>"],
	],
} as const satisfies UnitMap;
