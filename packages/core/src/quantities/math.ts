/**
 * @file Arithmetic helpers that perform numeric operations while avoiding floating-point errors.
 */

import { snap } from "./snap.ts";

/**
 * Multiplies numbers while avoiding floating-point errors.
 *
 * @param multiplier Number to multiply.
 * @param multiplicand Number to multiply by.
 *
 * @returns The product, corrected for floating-point error.
 *
 * @example
 * ```typescript
 * 0.1 * 0.1 // === 0.010000000000000002
 * ```
 *
 * ```typescript
 * multiplySafely(0.1, 0.1) // === 0.01
 * ```
 */
export function multiplySafely(
	multiplier: number,
	multiplicand: number,
): number {
	// * both integers → safe to multiply directly
	if (Number.isInteger(multiplier) && Number.isInteger(multiplicand))
		return multiplier * multiplicand;

	return snap(multiplier * multiplicand);
}

/**
 * Adds two numbers while avoiding floating-point errors.
 *
 * @param augend Number to add to.
 * @param addend Number to add.
 *
 * @returns The sum, corrected for floating-point error.
 *
 * @example
 * ```typescript
 * 1.2 + 0.005 // === 1.2049999999999998
 * ```
 *
 * ```typescript
 * addSafely(1.2, 0.005) // === 1.205
 * ```
 */
export function addSafely(augend: number, addend: number): number {
	// * both integers → safe to add directly
	if (Number.isInteger(augend) && Number.isInteger(addend))
		return augend + addend;

	return snap(augend + addend);
}

/**
 * Subtracts two numbers while avoiding floating-point errors.
 *
 * @param minuend Number to subtract from.
 * @param subtrahend Number to subtract.
 *
 * @returns The difference, corrected for floating-point error.
 *
 * @example
 * ```typescript
 * 1.2 - 0.005 // === 1.194999999999999
 * ```
 *
 * ```typescript
 * subtractSafely(1.2, 0.005) // === 1.195
 * ```
 */
export function subtractSafely(minuend: number, subtrahend: number): number {
	// * both integers → safe to subtract directly
	if (Number.isInteger(minuend) && Number.isInteger(subtrahend))
		return minuend - subtrahend;

	return snap(minuend - subtrahend);
}

/**
 * Divides two numbers while avoiding floating-point errors.
 *
 * @param divident Number to divide.
 * @param divisor Number to divide by.
 *
 * @returns The quotient, corrected for floating-point error.
 *
 * @throws {Error} if divisor is zero.
 *
 * @example
 * ```typescript
 * 0.3 / 0.05 // === 5.999999999999999
 * ```
 *
 * ```typescript
 * divideSafely(0.3, 0.05) // === 6
 * ```
 */
export function divideSafely(divident: number, divisor: number): number {
	if (divisor === 0) throw new Error("Attempted to divide by zero");

	// * both integers → safe to divide directly
	if (Number.isInteger(divident) && Number.isInteger(divisor))
		return divident / divisor;

	// * modern JS division produces no errors outside of float-point errors
	return snap(divident / divisor);
}

/**
 * Rounds value at the specified number of decimals while avoiding floating-point errors.
 *
 * @param value Number to round.
 * @param decimals Number of decimal places to round to.
 *
 * @returns The rounded value.
 *
 * @throws {Error} if decimals is not a non-negative integer.
 *
 * @example
 * ```typescript
 * roundSafely(1.255, 2)      // === 1.26
 * roundSafely(-1.255, 2)     // === -1.26
 * roundSafely(0, 2)          // === 0
 * roundSafely(1.254, 2)      // === 1.25
 * roundSafely(2.35, 1)       // === 2.4
 * roundSafely(-2.35, 1)      // === -2.4
 * roundSafely(999.995, 2)    // === 1000
 * roundSafely(0.005, 2)      // === 0.01
 * roundSafely(-0.005, 2)     // === -0.01
 * roundSafely(1.23456785, 7) // === 1.2345679
 * ```
 */
export function roundSafely(value: number, decimals: number = 0): number {
	if (!Number.isInteger(decimals))
		throw new Error(
			"Attempted to round safely with a non-integer decimals value",
		);

	if (decimals < 0)
		throw new Error(
			"Attempted to round safely with a negative decimals value",
		);

	if (decimals === 0) return Math.round(value);

	const factor = 10 ** decimals;
	// * we convert to absolute to allow clean and simple rounding of negative values
	const scaled = Math.abs(value) * factor;

	// * when scaled value exceeds `MAX_SAFE_INTEGER`, epsilon correction becomes unreliable due to precision loss
	// * we default to native rounding to produce *a* result
	if (scaled > Number.MAX_SAFE_INTEGER)
		return Math.sign(value) * (Math.round(scaled) / factor);

	// * adding epsilon is necessary to nudge certain values to their appropriate half (i.e. less than / more than `value % 0.5`)
	// & `1.2499999...` + epsilon ≈ `1.25` → rounds up, not down
	const epsilon = Number.EPSILON * scaled;
	const result = Math.round(scaled + epsilon) / factor;

	return Math.sign(value) * result;
}
