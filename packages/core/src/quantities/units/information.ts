/**
 * @file Information (digital storage) unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Information units.
 */
export const INFORMATION = {
	"<byte>": [["B", "byte", "bytes"], 1, "information", ["<byte>"]],
	"<bit>": [["b", "bit", "bits"], 0.125, "information", ["<byte>"]],
} as const satisfies UnitMap;
