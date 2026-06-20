/**
 * @file Time unit definitions.
 *
 * @example
 * ```ts
 * import TIME from "@quantities/units/time";
 * import { fortnight } from "@quantities/units/time";
 * ```
 */

import type { UnitEntry } from "@quantities/core";

export const fortnight: UnitEntry = {
	key: "<fortnight>",
	aliases: ["fortnight", "fortnights"],
	scalar: 2,
	kind: "time",
	numerator: ["<week>"],
};

export default [fortnight];
