/**
 * @file Speed unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Speed units.
 */
export const SPEED = {
	"<knot>": [
		["kt", "kn", "kts", "knot", "knots"],
		1,
		"speed",
		["<naut-mile>"],
		["<hour>"],
	],
} as const satisfies UnitMap;
