/**
 * @file Computes Novak unit signature numbers used to classify quantity dimensions.
 */

import type { Denominator, Numerator } from "../types.ts";
import type UnitRegistry from "./registry.ts";

/**
 * Ordered list of physical dimensions whose index determines each component's weight in a signature.
 */
export const SIGNATURE_VECTOR = [
	"length",
	"time",
	"temperature",
	"mass",
	"current",
	"substance",
	"luminosity",
	"currency",
	"information",
	"angle",
];

/**
 * Precomputed signature for temperature units.
 * Temperature units require special handling in arithmetic operations.
 */
export const TEMPERATURE_SIGNATURE = 400;

/**
 * Compute the Novak unit signature number for a quantity.
 * Reference:
 *   Novak, G.S., Jr. Conversion of units of measurement, IEEE Transactions on Software Engineering, 21(8), Aug 1995, pp.651-661
 *   doi:10.1109/32.403789
 *
 * @param numerator Numerator unit tokens.
 * @param denominator Denominator unit tokens.
 * @param registry Registry used to resolve each token's kind.
 *
 * @returns The signature number for the quantity.
 */
export function computeSignature(
	numerator: readonly Numerator[],
	denominator: readonly Denominator[],
	registry: UnitRegistry,
): number {
	// * `Array.fill()` defaults to type `unknown` for its value, thus not accurately typing the output
	const vector = Array.from({
		length: SIGNATURE_VECTOR.length,
	}).fill(0) as number[];

	for (const [units, delta] of [
		[numerator, 1],
		[denominator, -1],
	] as const) {
		for (const key of units) {
			const kind = registry.getKindForKey(key);

			if (kind) {
				const index = SIGNATURE_VECTOR.indexOf(kind);

				if (index >= 0) vector[index]! += delta;
			}
		}
	}

	return vector
		.map((signature, index) => signature * Math.pow(20, index))
		.reduce((previous, current) => previous + current, 0);
}
