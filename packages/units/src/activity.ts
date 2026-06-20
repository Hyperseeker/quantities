/**
 * @file Enzymatic and catalytic activity unit definitions.
 *
 * @example
 * ```ts
 * import ACTIVITY from "@quantities/units/activity";
 * import { katal, unit } from "@quantities/units/activity";
 * ```
 */

import type { UnitEntry } from "@quantities/core";

export const katal: UnitEntry = {
	key: "<katal>",
	aliases: ["kat", "katal", "Katal"],
	scalar: 1.0,
	kind: "activity",
	numerator: ["<mole>"],
	denominator: ["<second>"],
};

export const unit: UnitEntry = {
	key: "<unit>",
	aliases: ["U", "enzUnit", "unit"],
	scalar: 1,
	kind: "activity",
	numerator: ["<micro>", "<mole>"],
	denominator: ["<minute>"],
};

export default [katal, unit];
