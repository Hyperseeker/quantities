/**
 * @file Currency unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Currency units.
 */
export const CURRENCY = {
	"<dollar>": [["USD", "dollar", "dollars"], 1.0, "currency", ["<dollar>"]],
	"<cents>": [["cent", "cents"], 0.01, "currency", ["<dollar>"]],
} as const satisfies UnitMap;
