/**
 * @file Electric current unit definitions.
 *
 * @example
 * ```ts
 * import CURRENT from "@quantities/units/current";
 * import { biot, abampere } from "@quantities/units/current";
 * ```
 */

import type { UnitEntry } from "@quantities/core";

export const biot: UnitEntry = {
	key: "<biot>",
	aliases: ["Bi", "biot"],
	scalar: 10,
	kind: "current",
	numerator: ["<ampere>"],
};

export const abampere: UnitEntry = {
	key: "<abampere>",
	aliases: ["abA", "abampere"],
	scalar: 10,
	kind: "current",
	numerator: ["<ampere>"],
};

export default [biot, abampere];
