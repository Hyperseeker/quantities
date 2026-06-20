/**
 * @file Comparison operators and extremum helpers for quantities.
 */

import type { NonEmptyArray, QuantityString } from "../types.ts";
import Quantity, { ensureQuantity } from "./constructor.ts";
import { IncompatibleUnitsError, QuantityError } from "./error.ts";

/**
 * A value accepted by the extremum helpers.
 */
type ExtremumValue = QuantityString | number | Quantity;

/**
 * Predicate selecting which of two quantities wins.
 */
interface ExtremumComparator {
	(left: Quantity, right: Quantity): boolean;
}

/**
 * Returns a single value sorted via the comparator function provided.
 *
 * @param this Source quantity.
 * @param comparator Function to pick the returned value by.
 * @param values Values to find the target in.
 *
 * @returns Desired extremum as a quantity.
 */
function findExtremum(
	this: typeof Quantity,
	comparator: ExtremumComparator,
	values: NonEmptyArray<ExtremumValue>,
): Quantity {
	// * typing this as `NonEmptyArray<Quantity>` fails in nightly 7.0 of TypeScript because of lack of overlap due to the `readonly` modifier on `NonEmptyArray`
	const quantities = values.map((value) =>
		value instanceof Quantity ? value : new this(value),
	) as [Quantity, ...Quantity[]];

	const reference = quantities[0];

	for (const current of quantities)
		if (!reference.isCompatible(current))
			throw new IncompatibleUnitsError(
				reference.units(),
				current.units(),
			);

	// * this is a lot faster than sorting and picking the first element
	// * returns the winning instance itself, preserving its class and extensions
	return quantities.reduce((accumulator, quantity) => {
		return comparator(quantity, accumulator) ? quantity : accumulator;
	}, reference);
}

/**
 * Compare two quantities in base SI units.
 *
 * We cannot compare inverses as that breaks the general compareTo contract:
 *
 * - if `left.compareTo(right) < 0` then `right.compareTo(left) > 0`
 * - if `left.compareTo(right) === 0` then `right.compareTo(left) === 0`
 *
 * Since `"10S" === ".1ohm"` (10 > .1) and `"10ohm" === ".1S"` (10 > .1):
 * - `Quantity("10 S").invert().compareTo("10 ohm") === -1`
 * - `Quantity("10 ohm").invert().compareTo("10 S") === -1`
 *
 * If including inverses in the sort is needed, consider sorting by explicit target units.
 *
 * @returns `-1` ("less than"), `0` ("equals"), or `1` ("greater than")
 *
 * @throws if units are incompatible
 */
export function compare(
	comparable: Quantity,
	input: QuantityString | Quantity,
): number {
	const compared = ensureQuantity(input, comparable);

	if (!comparable.isCompatible(compared))
		throw new IncompatibleUnitsError(comparable.units(), compared.units());

	return Math.sign(comparable.baseScalar - compared.baseScalar);
}

/**
 * Compares two quantities via their base scalar.
 */
export function equals(
	self: Quantity,
	input: QuantityString | Quantity,
): boolean {
	return compare(self, input) === 0;
}

/**
 * Checks if quantity is smaller than input via their base scalar.
 */
export function lessThan(
	self: Quantity,
	input: QuantityString | Quantity,
): boolean {
	return compare(self, input) === -1;
}

/**
 * Checks if quantity is larger than input via their base scalar.
 */
export function greaterThan(
	self: Quantity,
	input: QuantityString | Quantity,
): boolean {
	return compare(self, input) === 1;
}

/**
 * Checks if quantity is smaller than or equal to input via their base scalar.
 */
export function lessThanOrEquals(
	self: Quantity,
	input: QuantityString | Quantity,
): boolean {
	return equals(self, input) || lessThan(self, input);
}

/**
 * Checks if quantity is larger than or equal to input via their base scalar.
 */
export function greaterThanOrEquals(
	self: Quantity,
	input: QuantityString | Quantity,
): boolean {
	return equals(self, input) || greaterThan(self, input);
}

/**
 * Checks whether the two quantities match exactly: same scalars and same units.
 *
 * @example Quantity("100 cm").isSame(Quantity("100 cm")) === true
 * @example Quantity("100 cm").isSame(Quantity("1 m")) === false
 */
export function isSame(self: Quantity, input: Quantity): boolean {
	return self.scalar === input.scalar && self.units() === input.units();
}

/**
 * Returns the smallest quantity from the provided arguments.
 * All arguments must be compatible units.
 *
 * @param values Values to compare.
 *
 * @returns A new {@link Quantity} instance representing the minimum value.
 *
 * @throws {QuantityError} if no arguments provided or units are incompatible.
 *
 * @example
 * Quantity.min(Quantity("5 m"), Quantity("10 m"), Quantity("3 m")) // => 3 m
 * Quantity.min(Quantity("100 cm"), "2 m") // => 100 cm
 */
export function min(
	this: typeof Quantity,
	...values: NonEmptyArray<ExtremumValue>
): Quantity {
	if (!values.length)
		throw new QuantityError(
			`Quantity.min(): requires at least one value to compare`,
		);

	return findExtremum.call(this, lessThan, values);
}

/**
 * Returns the largest quantity from the provided arguments.
 * All arguments must be compatible units.
 *
 * @param values Values to compare.
 *
 * @returns A new {@link Quantity} instance representing the maximum value.
 *
 * @throws {QuantityError} if no arguments provided or units are incompatible.
 *
 * @example
 * Quantity.max(Quantity("5 m"), Quantity("10 m"), Quantity("3 m")) // => 10 m
 * Quantity.max(Quantity("100 cm"), "2 m") // => 2 m
 */
export function max(
	this: typeof Quantity,
	...values: NonEmptyArray<ExtremumValue>
): Quantity {
	if (!values.length)
		throw new QuantityError(
			`Quantity.max(): requires at least one value to compare`,
		);

	return findExtremum.call(this, greaterThan, values);
}
