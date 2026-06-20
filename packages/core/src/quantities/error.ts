/**
 * @file Custom error classes thrown by quantity operations.
 */

import type { UnitString } from "../types.ts";

/**
 * Base error type for all quantity-related failures.
 */
export class QuantityError extends Error {
	constructor(message: string) {
		super(message);

		this.name = "QuantityError";
	}
}

export class IncompatibleUnitsError extends QuantityError {
	constructor(left: string, right: string) {
		super(`Incompatible units: ${left} and ${right}`);

		this.name = "IncompatibleUnitsError";
	}
}

export class TemperatureConversionError extends QuantityError {
	constructor(direction: "from" | "to", units: UnitString) {
		super(
			`Unknown type for temperature conversion ${direction} \`${units}\``,
		);

		this.name = "TemperatureConversionError";
	}
}
