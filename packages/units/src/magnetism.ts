/**
 * @file Magnetism unit definitions.
 *
 * @example
 * ```ts
 * import MAGNETISM from "@quantities/units/magnetism";
 * import { gauss, maxwell, oersted } from "@quantities/units/magnetism";
 * ```
 */

import type { UnitEntry } from "@quantities/core";

export const gauss: UnitEntry = {
	key: "<gauss>",
	aliases: ["G", "Gs", "gauss"],
	scalar: 1,
	kind: "magnetism",
	numerator: ["<gram>"],
	denominator: ["<biot>", "<second>", "<second>"],
};

export const maxwell: UnitEntry = {
	key: "<maxwell>",
	aliases: ["Mx", "maxwell", "maxwells"],
	scalar: 1e-8,
	kind: "magnetism",
	numerator: ["<gauss>", "<centi>", "<meter>", "<centi>", "<meter>"],
};

export const oersted: UnitEntry = {
	key: "<oersted>",
	aliases: ["Oe", "oersted", "oersteds"],
	scalar: 1,
	kind: "magnetism",
	numerator: ["<dyne>"],
	denominator: ["<maxwell>"],
};

export default [gauss, maxwell, oersted];
