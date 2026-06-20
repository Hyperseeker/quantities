/**
 * @file Predicate helpers describing the nature of a quantity.
 */

import type { DefinitionObject, Key } from "../types.ts";
import { type default as Quantity, ensureQuantity } from "./constructor.ts";
import { TEMPERATURE_SIGNATURE } from "./signature.ts";
import { BASE_UNITS, type BaseUnitKey, UNITY, UNITY_ARRAY } from "./units.ts";

/**
 * Checks whether `key` maps to a base unit.
 *
 * @param key Key to check.
 *
 * @returns `true` if `key` belongs to a base unit.
 */
function notBaseUnit(key: Key): boolean {
	return isUnity(key) || BASE_UNITS.includes(key as BaseUnitKey);
}

/**
 * Checks whether both quantities belong to the same registry.
 *
 * @param left First quantity to compare.
 * @param right Second quantity to compare.
 *
 * @returns `true` if both quantities share a registry.
 */
export function isSameRegistry(left: Quantity, right: Quantity): boolean {
	return left.registry === right.registry;
}

/**
 * Checks whether both numerator and denominator are unity arrays.
 *
 * @param self Quantity to inspect.
 *
 * @returns `true` if the quantity carries no units.
 */
export function isUnitless(self: Quantity): boolean {
	return [self.numerator, self.denominator].every((item) =>
		isUnityArray(item),
	);
}

/**
 * Checks whether another quantity shares this quantity's signature.
 *
 * @param self Quantity to compare against.
 * @param other Quantity (or its string form) to test for compatibility.
 *
 * @returns `true` if both quantities have the same signature.
 */
export function isCompatible(
	self: Quantity,
	other: string | Quantity,
): boolean {
	const rhs = ensureQuantity(other, self);

	return rhs.signature != null && self.signature === rhs.signature;
}

/**
 * Checks whether another quantity is compatible with this quantity's inverse.
 *
 * @param self Quantity whose inverse is tested.
 * @param other Quantity (or its string form) to test against the inverse.
 *
 * @returns `true` if `other` is compatible with the inverse.
 */
export function isInverse(self: Quantity, other: string | Quantity): boolean {
	return self.inverse().isCompatible(other);
}

/**
 * Checks whether the quantity is already a base: i.e. composed only of base units.
 *
 * @param self Quantity to inspect.
 *
 * @returns `true` if the quantity consists solely of base units.
 */
export function isBase(self: Quantity): boolean {
	const firstNumerator = self.numerator[0];

	if (!firstNumerator) return false;

	if (self.isDegrees() && firstNumerator.match(/<(kelvin|temp-K)>/))
		return true;

	return [...self.numerator, ...self.denominator].every(notBaseUnit);
}

/**
 * Returns its argument unchanged, for when no operation is required.
 *
 * @param value Value to return as-is.
 *
 * @returns The same `value`.
 */
export function identity<T>(value: T): T {
	return value;
}

/**
 * Checks whether an array is the canonical unity array.
 *
 * @param array Array of keys to test.
 *
 * @returns `true` if `array` is the unity array.
 */
export function isUnityArray(
	array: readonly Key[],
): array is typeof UNITY_ARRAY {
	return array.length === UNITY_ARRAY.length && array[0] === UNITY_ARRAY[0];
}

/**
 * Checks whether an item is the unity marker.
 *
 * @param item Value to test.
 *
 * @returns `true` if `item` is the unity marker.
 */
export function isUnity(item: string): item is typeof UNITY {
	return item === UNITY;
}

/**
 * Checks whether a value is a string.
 *
 * @param value Value to test.
 *
 * @returns `true` if `value` is a string.
 */
export function isString(value: unknown): value is string {
	return typeof value === "string";
}

/**
 * Checks whether a value is a finite number.
 *
 * @param value Value to test.
 *
 * @returns `true` if `value` is a finite number.
 */
export function isNumber(value: unknown): value is number {
	// * `Number.isFinite()` allows us not to consider `NaN` or strings (e.g. `"1"`) as numbers
	return Number.isFinite(value);
}

/**
 * Checks whether the quantity represents degrees or temperature.
 *
 * Accepts `signature === null` as the signature might not be computed yet.
 *
 * @param self Quantity to inspect.
 *
 * @returns `true` if the quantity represents degrees or temperature.
 */
export function isDegrees(self: Quantity): boolean {
	const signature = self.signature;
	const firstNumerator = self.numerator[0];

	return (
		(signature === null || signature === TEMPERATURE_SIGNATURE) &&
		self.numerator.length === 1 &&
		isUnityArray(self.denominator) &&
		(!!firstNumerator.match(/<temp-[CFRK]>/) ||
			!!firstNumerator.match(/<(kelvin|celsius|rankine|fahrenheit)>/))
	);
}

/**
 * Checks whether the quantity is an absolute temperature (`tempC`/`tempF`/`tempK`/`tempR`).
 *
 * @param self Quantity to inspect.
 *
 * @returns `true` if the quantity is an absolute temperature.
 */
export function isTemperature(self: Quantity): boolean {
	const firstNumerator = self.numerator[0];

	return self.isDegrees() && !!firstNumerator.match(/<temp-[CFRK]>/);
}

/**
 * Tests if a value is a Quantity definition object.
 *
 * @param value Value to test.
 *
 * @returns `true` if value is a definition object, `false` otherwise.
 */
export function isDefinitionObject(value: unknown): value is DefinitionObject {
	return !!value && typeof value === "object" && "scalar" in value;
}
