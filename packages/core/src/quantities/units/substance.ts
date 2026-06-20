/**
 * @file Substance (amount-of-substance) unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Amount-of-substance units.
 */
export const SUBSTANCE = {
	"<mole>": [["mol", "mole"], 1.0, "substance", ["<mole>"]],
} as const satisfies UnitMap;
