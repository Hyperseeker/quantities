/**
 * @file Prefix-only unit definitions: multipliers that only ever modify another unit.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Prefix-only units.
 */
export const PREFIX_ONLY = {
	"<dozen>": [["doz", "dz", "dozen"], 12.0, "prefix_only", ["<each>"]],
	"<percent>": [["%", "percent"], 0.01, "prefix_only", ["<1>"]],
	"<ppm>": [["ppm"], 1e-6, "prefix_only", ["<1>"]],
	"<ppb>": [["ppb"], 1e-9, "prefix_only", ["<1>"]],
} as const satisfies UnitMap;
