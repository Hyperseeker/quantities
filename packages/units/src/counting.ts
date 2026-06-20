/**
 * @file Counting unit definitions.
 *
 * Dimensionless units used for counting discrete entities.
 *
 * @example
 * ```ts
 * import COUNTING from "@quantities/units/counting";
 * import { cell, basePair, molecule } from "@quantities/units/counting";
 * ```
 */

import type { UnitEntry } from "@quantities/core";

export const cell: UnitEntry = {
	key: "<cell>",
	aliases: ["cells", "cell"],
	scalar: 1,
	kind: "counting",
	numerator: ["<each>"],
};

export const basePair: UnitEntry = {
	key: "<base-pair>",
	aliases: ["bp", "base-pair"],
	scalar: 1.0,
	kind: "counting",
	numerator: ["<each>"],
};

export const nucleotide: UnitEntry = {
	key: "<nucleotide>",
	aliases: ["nt", "nucleotide"],
	scalar: 1.0,
	kind: "counting",
	numerator: ["<each>"],
};

export const molecule: UnitEntry = {
	key: "<molecule>",
	aliases: ["molecule", "molecules"],
	scalar: 1.0,
	kind: "counting",
	numerator: ["<1>"],
};

export default [cell, basePair, nucleotide, molecule];
