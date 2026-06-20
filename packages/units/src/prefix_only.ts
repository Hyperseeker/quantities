/**
 * @file Prefix-only unit definitions.
 *
 * Units that exist solely as prefixed ratios or counts.
 *
 * @example
 * ```ts
 * import PREFIX_ONLY from "@quantities/units/prefix_only";
 * import { ppt, ppq, gross } from "@quantities/units/prefix_only";
 * ```
 */

import type { UnitEntry } from "@quantities/core";

export const ppt: UnitEntry = {
	key: "<ppt>",
	aliases: ["ppt"],
	scalar: 1e-12,
	kind: "prefix_only",
	numerator: ["<1>"],
};

export const ppq: UnitEntry = {
	key: "<ppq>",
	aliases: ["ppq"],
	scalar: 1e-15,
	kind: "prefix_only",
	numerator: ["<1>"],
};

export const gross: UnitEntry = {
	key: "<gross>",
	aliases: ["gross"],
	scalar: 1,
	kind: "prefix_only",
	numerator: ["<dozen>", "<dozen>"],
};

export default [ppt, ppq, gross];
