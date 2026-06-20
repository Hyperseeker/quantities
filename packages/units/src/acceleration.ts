/**
 * @file Acceleration unit definitions.
 *
 * @example
 * ```ts
 * import ACCELERATION from "@quantities/units/acceleration";
 * import { gal } from "@quantities/units/acceleration";
 * ```
 */

import type { UnitEntry } from "@quantities/core";

export const gal: UnitEntry = {
	key: "<Gal>",
	aliases: ["Gal"],
	scalar: 1,
	kind: "acceleration",
	numerator: ["<centi>", "<meter>"],
	denominator: ["<second>", "<second>"],
};

export default [gal];
