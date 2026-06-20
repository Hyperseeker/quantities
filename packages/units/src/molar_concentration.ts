/**
 * @file Molar concentration unit definitions.
 *
 * @example
 * ```ts
 * import MOLAR_CONCENTRATION from "@quantities/units/molar_concentration";
 * import { wtpercent } from "@quantities/units/molar_concentration";
 * ```
 */

import type { UnitEntry } from "@quantities/core";

export const wtpercent: UnitEntry = {
	key: "<wtpercent>",
	aliases: ["wt%", "wtpercent"],
	scalar: 0.01,
	kind: "molar_concentration",
	numerator: ["<kilo>", "<gram>"],
	denominator: ["<liter>"],
};

export default [wtpercent];
