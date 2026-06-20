/**
 * @file Typography unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Typography units.
 */
export const TYPOGRAPHY = {
	"<dpi>": [["dpi"], 1, "typography", ["<dot>"], ["<inch>"]],
} as const satisfies UnitMap;
