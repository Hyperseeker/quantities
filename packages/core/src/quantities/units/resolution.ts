/**
 * @file Resolution unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Resolution units.
 */
export const RESOLUTION = {
	"<dot>": [["dot", "dots"], 1, "resolution", ["<each>"]],
	"<pixel>": [["pixel", "pixels", "px"], 1, "resolution", ["<each>"]],
	"<ppi>": [["ppi"], 1, "resolution", ["<pixel>"], ["<inch>"]],
} as const satisfies UnitMap;
