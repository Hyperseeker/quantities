/**
 * @file Mass unit definitions.
 *
 * Includes historical masses and atomic mass units.
 *
 * @example
 * ```ts
 * import MASS from "@quantities/units/mass";
 * import { grain, dalton, amu } from "@quantities/units/mass";
 * ```
 */

import type { UnitEntry } from "@quantities/core";

export const grain: UnitEntry = {
	key: "<grain>",
	aliases: ["gr", "grain", "grains"],
	scalar: 1 / 7000,
	kind: "mass",
	numerator: ["<pound>"],
};

export const slug: UnitEntry = {
	key: "<slug>",
	aliases: ["slug", "slugs"],
	scalar: 32.17404856,
	kind: "mass",
	numerator: ["<pound>"],
};

export const dram: UnitEntry = {
	key: "<dram>",
	aliases: ["dram", "drams", "dr"],
	scalar: 1 / 16,
	kind: "mass",
	numerator: ["<ounce>"],
};

export const dalton: UnitEntry = {
	key: "<dalton>",
	aliases: ["Da", "Dalton", "Daltons", "dalton", "daltons"],
	scalar: 1.66053906892,
	kind: "mass",
	numerator: ["<yocto>", "<gram>"],
};

export const amu: UnitEntry = {
	key: "<AMU>",
	aliases: ["u", "AMU", "amu"],
	scalar: 1,
	kind: "mass",
	numerator: ["<dalton>"],
};

export default [grain, slug, dram, dalton, amu];
