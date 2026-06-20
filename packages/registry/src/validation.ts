/**
 * @file Validation utilities for unit and prefix registration.
 * Ensures unit definitions are well-formed, references exist, and no cycles occur.
 */

import type {
	Alias,
	Key,
	PrefixEntry,
	Scalar,
	UnitEntry,
	UnitMap,
} from "@quantities/core";
import { objectEntries, objectKeys, QuantityError } from "@quantities/core";

/**
 * Validates that a scalar is a finite number.
 *
 * @param value The scalar value to validate.
 * @param key The unit key for error messages.
 *
 * @throws {QuantityError} if value is not a finite number.
 */
export function validateScalar(value: Scalar, key: Key): void {
	if (!Number.isFinite(value))
		throw new QuantityError(
			`validateScalar(): ${key}: Invalid unit definition. Scalar must be a finite number`,
		);
}

/**
 * Validates that all referenced units exist in the unit map.
 *
 * @param key The unit key being validated.
 * @param numerator Array of unit keys in the numerator.
 * @param denominator Array of unit keys in the denominator.
 * @param units The complete unit map to check against.
 *
 * @throws {QuantityError} if any referenced unit is not found.
 */
export function validateReferences(
	key: Key,
	numerator: readonly Key[] = [],
	denominator: readonly Key[] = [],
	units: UnitMap,
): void {
	for (const unit of numerator)
		if (!units[unit])
			throw new QuantityError(
				`validateReferences(): \`${key}\`: invalid unit definition, unit \`${unit}\` in numerator is not recognized`,
			);

	for (const unit of denominator)
		if (!units[unit])
			throw new QuantityError(
				`validateReferences(): \`${key}\`: invalid unit definition, unit \`${unit}\` in denominator is not recognized`,
			);
}

/**
 * Detects cycles in the unit dependency graph using depth-first search.
 * A cycle occurs when a unit's definition eventually references itself.
 *
 * @param units The complete unit map to check.
 *
 * @throws {QuantityError} if a cycle is detected.
 *
 * @example
 * ```ts
 * // this would create a cycle:
 * // <foo> = [[], 1, "test", ["<bar>"]]
 * // <bar> = [[], 1, "test", ["<foo>"]]
 * detectCycles(units); // throws
 * ```
 */
export function detectCycles(units: UnitMap): void {
	const visiting = new Set<Key>();
	const visited = new Set<Key>();

	const dfs = (key: Key): void => {
		if (visited.has(key)) return;

		if (visiting.has(key))
			throw new QuantityError(
				`detectCycles(): Cycle detected in unit definitions at ${key}`,
			);

		visiting.add(key);

		const definition = units[key];

		if (definition) {
			const [, , , numerator = [], denominator = []] = definition;
			const references = [...numerator, ...denominator];

			for (const reference of references) {
				// * allow self-referential base definitions
				// * e.g., `<meter>` -> `[<meter>]`
				if (reference === key) continue;

				if (units[reference]) dfs(reference);
			}
		}

		visiting.delete(key);
		visited.add(key);
	};

	objectKeys(units).forEach((key) => dfs(key));
}

/**
 * Checks for alias collisions within a set of unit definitions.
 *
 * @param units The unit map to check.
 * @param allowOverride If true, overrides any existing units under the same key.
 *
 * @returns Map of alias to canonical key.
 *
 * @throws {QuantityError} if collision detected and `allowOverride` is false.
 */
export function checkUnitAliasCollisions(
	units: UnitMap,
	allowOverride: boolean = false,
): Record<Alias, Key> {
	const aliasToKey: Record<Alias, Key> = Object.create(null);

	const keyedTuples = objectEntries(units).filter(
		([, tuple]) => tuple[2] !== "prefix",
	);

	for (const [key, tuple] of keyedTuples) {
		for (const alias of tuple[0]) {
			const previous = aliasToKey[alias];

			if (previous && previous !== key && !allowOverride)
				throw new QuantityError(
					`checkUnitAliasCollisions(): Alias collision: \`${alias}\` for \`${key}\` already used by \`${previous}\``,
				);

			aliasToKey[alias] = key;
		}
	}

	return aliasToKey;
}

/**
 * Check for alias collisions within prefix definitions.
 *
 * @param units The unit map to check.
 * @param allowOverride If true, overrides any existing units under the same key.
 *
 * @returns Map of alias to canonical key.
 *
 * @throws {QuantityError} if collision detected and `allowOverride` is false.
 */
export function checkPrefixAliasCollisions(
	units: UnitMap,
	allowOverride: boolean = false,
): Record<Alias, Key> {
	const aliasToKey: Record<Alias, Key> = Object.create(null);

	const prefixTuples = objectEntries(units).filter(
		([, tuple]) => tuple[2] === "prefix",
	);

	for (const [key, tuple] of prefixTuples) {
		for (const alias of tuple[0]) {
			const previous = aliasToKey[alias];

			if (previous && previous !== key && !allowOverride)
				throw new QuantityError(
					`checkPrefixAliasCollisions(): Prefix alias collision: \`${alias}\` for \`${key}\` already used by \`${previous}\``,
				);

			aliasToKey[alias] = key;
		}
	}

	return aliasToKey;
}

/**
 * Validate a complete unit entry before registration.
 *
 * @param entry The unit entry to validate.
 * @param existingUnits The current unit map.
 *
 * @throws {QuantityError} if validation fails.
 */
export function validateUnitEntry(
	entry: UnitEntry,
	existingUnits: UnitMap,
): void {
	validateScalar(entry.scalar, entry.key);

	if (entry.numerator || entry.denominator)
		validateReferences(
			entry.key,
			entry.numerator,
			entry.denominator,
			existingUnits,
		);
}

/**
 * Validate a complete prefix entry before registration.
 *
 * @param entry The prefix entry to validate.
 *
 * @throws {QuantityError} if validation fails.
 */
export function validatePrefixEntry(entry: PrefixEntry): void {
	validateScalar(entry.scalar, entry.key);
}
