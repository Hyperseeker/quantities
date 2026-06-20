/**
 * @file Shared test fixtures.
 */

import type { UnitEntry } from "@quantities/core";

/**
 * A minimal counting unit used as a registration fixture.
 */
export const UNIT_WIDGET: UnitEntry = {
	key: "<widget>",
	aliases: ["widget", "widgets"],
	scalar: 1,
	kind: "counting",
	numerator: ["<each>"],
};

/**
 * A counting unit defined in terms of {@link UNIT_WIDGET}.
 */
export const UNIT_SUPER_WIDGET: UnitEntry = {
	key: "<super-widget>",
	aliases: ["super-widget"],
	scalar: 100,
	kind: "counting",
	numerator: ["<widget>"],
};
