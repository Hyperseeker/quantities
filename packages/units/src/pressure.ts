/**
 * @file Pressure unit definitions.
 *
 * @example
 * ```ts
 * import PRESSURE from "@quantities/units/pressure";
 * import { cmH2O, inH2O } from "@quantities/units/pressure";
 * ```
 */

import type { UnitEntry } from "@quantities/core";

export const cmH2O: UnitEntry = {
	key: "<cmh2o>",
	aliases: ["cmH2O", "cmh2o"],
	scalar: 98.0638,
	kind: "pressure",
	numerator: ["<pascal>"],
};

export const inH2O: UnitEntry = {
	key: "<inh2o>",
	aliases: ["inH2O", "inh2o", "iwg", "inAq"],
	scalar: 2.54,
	kind: "pressure",
	numerator: ["<cmh2o>"],
};

export default [cmH2O, inH2O];
