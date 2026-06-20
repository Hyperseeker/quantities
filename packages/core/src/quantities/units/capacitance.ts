/**
 * @file Capacitance unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Capacitance units.
 */
export const CAPACITANCE = {
	"<farad>": [
		["F", "farad", "Farad"],
		1.0,
		"capacitance",
		["<coulomb>"],
		["<volt>"],
	],
} as const satisfies UnitMap;
