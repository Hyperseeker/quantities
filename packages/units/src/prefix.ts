/**
 * @file Prefix unit definitions.
 *
 * @example
 * ```ts
 * import PREFIX from "@quantities/units/prefix";
 * import { googol } from "@quantities/units/prefix";
 * ```
 */

import type { UnitEntry } from "@quantities/core";

export const googol: UnitEntry = {
	key: "<googol>",
	aliases: ["googol"],
	scalar: 1e100,
	kind: "prefix",
};

export default [googol];
