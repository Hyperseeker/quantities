/**
 * @file Angle unit definitions.
 *
 * @example
 * ```ts
 * import ANGLE from "@quantities/units/angle";
 * import { gradian } from "@quantities/units/angle";
 * ```
 */

import type { UnitEntry } from "@quantities/core";

export const gradian: UnitEntry = {
	key: "<gradian>",
	aliases: ["gon", "grad", "gradian", "grads"],
	scalar: 0.9,
	kind: "angle",
	numerator: ["<degree>"],
};

export default [gradian];
