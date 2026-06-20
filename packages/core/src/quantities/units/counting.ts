/**
 * @file Counting unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Counting units.
 */
export const COUNTING = {
	"<each>": [["each"], 1.0, "counting", ["<each>"]],
	"<count>": [["count"], 1.0, "counting", ["<each>"]],
} as const satisfies UnitMap;
