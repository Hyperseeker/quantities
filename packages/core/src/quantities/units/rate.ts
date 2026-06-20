/**
 * @file Rate unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Rate (count-per-time) units.
 */
export const RATE = {
	"<bpm>": [["bpm"], 1.0 / 60.0, "rate", ["<count>"], ["<second>"]],
} as const satisfies UnitMap;
