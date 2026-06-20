/**
 * @file Energy unit definitions.
 *
 * @example
 * ```ts
 * import ENERGY from "@quantities/units/energy";
 * import { erg, electronvolt, thermUS } from "@quantities/units/energy";
 * ```
 */

import type { UnitEntry } from "@quantities/core";

export const erg: UnitEntry = {
	key: "<erg>",
	aliases: ["erg", "ergs"],
	scalar: 100,
	kind: "energy",
	numerator: ["<nano>", "<joule>"],
};

export const thermUS: UnitEntry = {
	key: "<therm-US>",
	aliases: ["th", "therm", "therms", "Therm", "therm-US"],
	scalar: 105_480_400,
	kind: "energy",
	numerator: ["<joule>"],
};

export const electronvolt: UnitEntry = {
	key: "<electronvolt>",
	aliases: ["eV", "electronvolt", "electronvolts"],
	scalar: 1.602176634e-19,
	kind: "energy",
	numerator: ["<joule>"],
};

export default [erg, thermUS, electronvolt];
