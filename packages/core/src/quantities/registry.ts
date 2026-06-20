/**
 * @file `UnitRegistry` owns the set of unit and prefix definitions along with all derived lookup structures and caches that the parser, converter, and formatter need. Registries are immutable after construction.
 *
 * Typical usage (default registry):
 * @example
 * ```ts
 * import Quantity from '@quantities/core';
 *
 * Quantity('3 meters').to('feet');
 * ```
 *
 * Custom registry usage:
 * @example
 * ```ts
 * import { createRegistry, withRegistry } from '@quantities/registry';
 *
 * const registry = createRegistry({
 *   key: '<widget>',
 *   aliases: ['widget', 'widgets'],
 *   scalar: 1,
 *   kind: 'counting',
 *   numerator: ['<each>']
 * });
 * const { default: Q } = withRegistry(registry);
 *
 * Q('2 widgets').to('each'); // -> "2 each"
 * ```
 */

import type {
	Alias,
	Aliases,
	Denominator,
	ExpandedUnitValue,
	Key,
	Kind,
	Name,
	NonEmptyArray,
	Numerator,
	Scalar,
	UnitMap,
	UnitString,
	UnitValue,
} from "../types.ts";
import { isNonEmptyArray, objectKeys } from "../utils.ts";
import { QuantityError } from "./error.ts";
import { divideSafely, multiplySafely } from "./math.ts";
import { isUnityArray } from "./predicates.ts";
import { computeSignature } from "./signature.ts";
import { UNITS, UNITY_ARRAY } from "./units.ts";

/**
 * A prefix + unit split candidate considered when matching a token.
 */
interface Match {
	prefix: {
		key: Key;
		length: number;
	};
	unit: {
		key: Key;
		length: number;
	};
}

/**
 * Kinds excluded from public unit listings.
 */
const FILTERED_KINDS = ["", "prefix"] satisfies Kind[];

class UnitRegistry {
	private _units: UnitMap;

	private PREFIX_VALUES: Record<Key, Scalar> = Object.create(null);
	private PREFIX_MAP: Record<Alias, Key> = Object.create(null);
	private UNIT_VALUES: Record<Key, ExpandedUnitValue> = Object.create(null);
	private UNIT_MAP: Record<Alias, Key> = Object.create(null);
	private OUTPUT_MAP: Record<Key, /* Primary */ Alias> = Object.create(null);
	private SORTED_PREFIXES: Alias[] = [];

	private readonly CACHE__PARSED_UNITS = new Map<UnitString, Key[]>();
	private readonly CACHE__BASE_UNITS = new Map<string, ExpandedUnitValue>();
	private readonly CACHE__SIGNATURE = new Map<string, number>();

	/**
	 * Create a registry populated with the provided initial definitions.
	 * If omitted, the default definitions are used.
	 *
	 * @param initial Optional initial definitions map.
	 */
	constructor(initial?: UnitMap) {
		this._units = initial ?? UNITS;

		this.build();
	}

	/**
	 * A read-only view of the current source definition table.
	 */
	get units(): UnitMap {
		return this._units;
	}

	/**
	 * List available units by kind.
	 *
	 * @param kind Optional kind (e.g. "length"). If omitted, returns all unit keys (without angle brackets) excluding prefixes and empty-kind entries.
	 *
	 * @returns Sorted list of unit names (canonical keys without the surrounding angle brackets).
	 *
	 * @throws {QuantityError} When a non-existent kind is requested.
	 *
	 * @example
	 * ```ts
	 * registry.getUnits('length'); // ['angstrom','foot','inch','meter', ...]
	 * registry.getUnits();         // all non-prefix units
	 * ```
	 */
	getUnits(kind?: Kind): Name[] {
		const keys = objectKeys(this._units);

		const recognizedKinds = new Set<Kind>(
			keys.map((key) => this.getKindForKey(key)!).filter(notExcludedKind),
		);

		if (kind !== undefined && !recognizedKinds.has(kind))
			throw new QuantityError("getUnits(): Kind not recognized");

		return keys
			.filter((key) => {
				const keyKind = this.getKindForKey(key);

				if (!keyKind || !notExcludedKind(keyKind)) return false;

				return kind === undefined || keyKind === kind;
			})
			.map((key) => key.substring(1, key.length - 1))
			.sort((previous, current) =>
				previous.toLowerCase().localeCompare(current.toLowerCase()),
			);
	}

	/**
	 * Return unit keys for a given kind. Excludes prefixes and empty-kind entries.
	 *
	 * @internal
	 */
	getUnitKeys(kind?: Kind): Key[] {
		const keys = objectKeys(this._units);

		return keys.filter((key) => {
			const keyKind = this.getKindForKey(key);

			if (!keyKind || !notExcludedKind(keyKind)) return false;

			return kind === undefined || keyKind === kind;
		});
	}

	/**
	 * Return the list of aliases for the unit identified by the provided alias.
	 * The first alias in the returned array is the default output name.
	 *
	 * @param unitName Any known alias for the unit (e.g. "m", "meter", "metre").
	 *
	 * @returns Array of all aliases for the resolved canonical unit key.
	 *
	 * @throws {QuantityError} When the alias cannot be resolved to a unit.
	 */
	getAliases(unitName: Alias): Aliases {
		const key = this.UNIT_MAP[unitName];

		if (!key) throw new QuantityError("getAliases(): Unit not recognized");

		const tuple = this._units[key];

		if (!tuple)
			throw new QuantityError("getAliases(): Unit not recognized");

		return tuple[0];
	}

	/** @internal */
	isPrefix(token: Key): boolean {
		return this.PREFIX_VALUES[token] !== undefined;
	}

	/** @internal */
	getPrefixValue(prefixKey: Key): number {
		return this.PREFIX_VALUES[prefixKey] ?? 1;
	}

	/** @internal */
	getUnitValue(unitKey: Key): ExpandedUnitValue | undefined {
		return this.UNIT_VALUES[unitKey];
	}

	/** @internal */
	getOutputName(key: Key): Name {
		return this.OUTPUT_MAP[key] ?? "";
	}

	/** @internal */
	getKindForKey(key: Key): Kind | undefined {
		if (this._units[key]) return this._units[key][2];

		return;
	}

	/**
	 * Get the Novak unit signature for a unit vector.
	 *
	 * @param numerator Numerator unit tokens.
	 * @param denominator Denominator unit tokens.
	 *
	 * @returns The signature number for the unit vector.
	 */
	getSignature(
		numerator: readonly Numerator[],
		denominator: readonly Denominator[],
	): number {
		const key = getUnitKey(numerator, denominator);
		const cached = this.CACHE__SIGNATURE.get(key);

		if (cached !== undefined) return cached;

		const signature = computeSignature(numerator, denominator, this);

		this.CACHE__SIGNATURE.set(key, signature);

		return signature;
	}

	/**
	 * Get the first (primary) alias for a unit key.
	 *
	 * @internal
	 */
	getPrimaryAlias(key: Key): Alias | undefined {
		if (this._units[key]) return this._units[key][0][0];

		return;
	}

	/**
	 * Get the scalar for a unit key.
	 *
	 * @internal
	 */
	getScalar(key: Key): Scalar | undefined {
		if (this._units[key]) return this._units[key][1];

		return;
	}

	/**
	 * Get the absolute base-unit scalar for a unit expression.
	 *
	 * @param unit Unit expression to expand to base units.
	 *
	 * @returns The scalar factor relative to base units.
	 *
	 * @throws {QuantityError} When the unit expression is not recognized.
	 */
	getBaseScalar(unit: UnitString): Scalar {
		const keys = this.parseUnits(unit);

		if (!isNonEmptyArray(keys))
			throw new QuantityError(`getBaseScalar(): Unknown unit: ${unit}`);

		return this.expandToBase(keys, UNITY_ARRAY).scalar;
	}

	/**
	 * Test whether a space-separated product of unit tokens is valid in this registry.
	 *
	 * @param string A sequence like "m s s" or "k Pa".
	 *
	 * @returns True if every token is a known alias; false otherwise.
	 */
	isValidUnitProduct(string: UnitString): boolean {
		return !!this.parseUnits(string).length;
	}

	/**
	 * Parses a unit expression into the registry's normalized token array.
	 *
	 * @param units Expression like "kg*m/s^2" or "kPa", split into numerator/denominator by caller.
	 *
	 * @returns Array of canonical tokens (e.g. ["<kilo>", "<meter>", "<second>", "<second>"]).
	 *
	 * @throws {QuantityError} when the expression contains unknown aliases.
	 *
	 * @example
	 * ```ts
	 * registry.parseUnits('m s s'); // ['<meter>','<second>','<second>']
	 * registry.parseUnits('kPa');   // ['<kilo>','<pascal>']
	 * registry.parseUnits('µs');    // ['<micro>','<second>']
	 * ```
	 */
	parseUnits(units: UnitString): Key[] {
		const cached = this.CACHE__PARSED_UNITS.get(units);

		if (cached) return cached;

		const tokens = units
			.replace(/\*\*/g, "^")
			.split(/[\s*]+/)
			.filter(Boolean)
			.flatMap((token) => this.matchToken(token));

		this.CACHE__PARSED_UNITS.set(units, tokens);

		return tokens;
	}

	/**
	 * Matches a single token to canonical keys.
	 */
	private matchToken(token: string): Key[] {
		const unit = this.matchUnit(token);

		if (unit) return unit;

		const exponentMatch = token.match(/^(.+?)(\^)?([0-4])$/);

		if (!exponentMatch)
			throw new QuantityError("matchToken(): Unit not recognized");

		const [, base, caret, exp] = exponentMatch;

		// * without `^`, the base must not end in a digit
		// * to avoid "m42" matching as "m4" + "2"
		if (!caret && /\d$/.test(base!))
			throw new QuantityError("matchToken(): Unit not recognized");

		const exponent = Number.parseInt(exp!);

		if (exponent === 0) return [];

		// * the base resolves through `matchUnit`, never back through `matchToken`:
		// * nested exponents (e.g. "m2^3") are not a supported form and throw here
		const baseKeys = this.matchUnit(base!);

		if (!baseKeys)
			throw new QuantityError("matchToken(): Unit not recognized");

		const total = exponent * baseKeys.length;
		// * `new Array()` may be unclear, but it is by far the most performant in Bun
		// oxlint-disable-next-line unicorn/no-new-array
		const result = new Array<Key>(total);

		// * this is by far the fastest approach of the ones tested
		for (let index = 0; index < total; index++)
			// * we know `baseKeys[index % baseKeys.length]` is not null because `index % baseKeys.length` is always within [0, baseKeys.length), therefore `index` is always within bounds
			result[index] = baseKeys[index % baseKeys.length]!;

		return result;
	}

	/**
	 * Matches a token without an exponent: an exact unit, or a prefix + unit.
	 *
	 * @returns Canonical keys, or `null` when the token resolves to neither.
	 */
	private matchUnit(token: string): Key[] | null {
		const unitKey = this.UNIT_MAP[token];

		if (unitKey) return [unitKey];

		// * if not exact unit, try all combinations of prefix + unit
		let bestMatch: Match | null = null;

		for (const alias of this.SORTED_PREFIXES) {
			if (!token.startsWith(alias)) continue;

			const remainder = token.slice(alias.length);
			const remainderKey = this.UNIT_MAP[remainder];

			if (!remainderKey) continue;

			const current = {
				prefix: {
					key: this.PREFIX_MAP[alias]!,
					length: alias.length,
				},
				unit: {
					key: remainderKey,
					length: remainder.length,
				},
			} satisfies Match;

			if (!bestMatch) {
				bestMatch = current;
			} else {
				if (
					current.prefix.key !== bestMatch.prefix.key &&
					Math.abs(current.prefix.length - bestMatch.prefix.length) >
						1
				) {
					// * keep whichever has longest PREFIX
					if (current.prefix.length > bestMatch.prefix.length)
						bestMatch = current;
				} else {
					// * keep whichever has longest UNIT
					if (current.unit.length > bestMatch.unit.length)
						bestMatch = current;
				}
			}
		}

		return bestMatch ? [bestMatch.prefix.key, bestMatch.unit.key] : null;
	}

	/**
	 * Expands a normalized unit vector to base units and a scalar factor.
	 *
	 * @param numerator Normalized numerator tokens.
	 * @param denominator Normalized denominator tokens.
	 *
	 * @returns An object with `scalar`, `numerator`, and `denominator` in base units.
	 *
	 * @example
	 * ```ts
	 * registry.expandToBase(['<kilo>','<meter>'], ['<second>']);
	 * // => { scalar: 1000, numerator: ['<meter>'], denominator: ['<second>'] }
	 * ```
	 */
	expandToBase(
		numerator: readonly Numerator[],
		denominator: readonly Denominator[] = UNITY_ARRAY,
	): ExpandedUnitValue {
		const cacheKey = getUnitKey(numerator, denominator);
		const cached = this.CACHE__BASE_UNITS.get(cacheKey);

		if (cached) return cached;

		const numeratorGroups: Numerator[] = [];
		const denominatorGroups: Denominator[] = [];

		let factor = 1;

		// * these loops could potentially use `.reduce()` but the current approach is:
		// * more readable for the complex prefix/unit handling logic
		// * accumulates into multiple variables
		// * has conditional array pushing based on `value.numerator`/`value.denominator` existence
		for (const unit of numerator) {
			if (this.isPrefix(unit)) {
				factor = multiplySafely(factor, this.getPrefixValue(unit));
			} else {
				const value = this.getUnitValue(unit);

				if (value) {
					factor = multiplySafely(factor, value.scalar);

					numeratorGroups.push(...value.numerator);
					denominatorGroups.push(...value.denominator);
				}
			}
		}

		for (const unit of denominator) {
			if (this.isPrefix(unit)) {
				factor = divideSafely(factor, this.getPrefixValue(unit));
			} else {
				const value = this.getUnitValue(unit);

				if (value) {
					factor = divideSafely(factor, value.scalar);

					// * inverted (numerator pushes to denominators) because denominator is `N^-1`
					denominatorGroups.push(...value.numerator);
					numeratorGroups.push(...value.denominator);
				}
			}
		}

		const result = {
			scalar: factor,
			numerator: numeratorGroups,
			denominator: denominatorGroups,
		};

		this.CACHE__BASE_UNITS.set(cacheKey, result);

		return result;
	}

	/**
	 * Checks if a key is a base unit (self-referential definition) in the raw values table.
	 *
	 * @internal
	 */
	private isBaseUnitKey(
		key: Key,
		rawValues: Record<Key, UnitValue>,
	): boolean {
		const value = rawValues[key];

		return (
			value !== undefined &&
			value.numerator?.length === 1 &&
			value.numerator[0] === key &&
			isUnityArray(value.denominator)
		);
	}

	/**
	 * Expands a unit's numerator/denominator to base units with full scalar computation.
	 * Recursively expands all non-base units, multiplying their scalars.
	 *
	 * @param numerator Unit keys to expand.
	 * @param denominator Unit keys to expand.
	 * @param rawValues The raw (non-expanded) unit values lookup.
	 * @param visiting Set of keys currently being expanded (cycle detection).
	 *
	 * @returns Fully expanded scalar, numerator, and denominator.
	 */
	private expandRawToBase(
		numerator: NonEmptyArray<Numerator>,
		denominator: NonEmptyArray<Denominator>,
		rawValues: Record<Key, UnitValue>,
		visiting: Set<Key> = new Set(),
	): ExpandedUnitValue {
		const numeratorTerms: Numerator[] = [];
		const denominatorTerms: Denominator[] = [];

		// * accumulate the numerator (multiplying), then the denominator
		// * (dividing) into the same running scalar; dividing sequentially —
		// * rather than by a pre-multiplied product — keeps the result identical
		// * to expanding each side in turn
		let scalar = this.expandInto(
			numerator,
			rawValues,
			visiting,
			1,
			numeratorTerms,
			denominatorTerms,
			false,
		);

		scalar = this.expandInto(
			denominator,
			rawValues,
			visiting,
			scalar,
			denominatorTerms,
			numeratorTerms,
			true,
		);

		return {
			scalar,
			numerator: numeratorTerms,
			denominator: denominatorTerms,
		};
	}

	/**
	 * Accumulates one product of raw unit terms into a running expansion.
	 *
	 * Prefixes on base units are preserved in the output; on derived units they fold into the scalar. Derived units expand recursively, with `visiting` breaking cycles by treating a revisited unit as a base unit.
	 *
	 * @param terms Unit keys forming a single product.
	 * @param rawValues The raw (non-expanded) unit values lookup.
	 * @param visiting Set of keys currently being expanded (cycle detection).
	 * @param scalar The running scalar to accumulate into.
	 * @param own Output array for this side's own terms (numerator or denominator).
	 * @param swap Output array for the opposite side (recursion swaps sides).
	 * @param invert When `true`, terms divide the scalar (denominator); otherwise multiply (numerator).
	 *
	 * @returns The updated running scalar.
	 */
	private expandInto(
		terms: readonly Key[],
		rawValues: Record<Key, UnitValue>,
		visiting: Set<Key>,
		scalar: number,
		own: Key[],
		swap: Key[],
		invert: boolean,
	): number {
		const apply = invert ? divideSafely : multiplySafely;

		for (let index = 0; index < terms.length; index++) {
			// * we know `unit` exists because we iterate within `terms`'s bounds
			const unit = terms[index]!;

			// * terms can feature prefixes, so we need to handle those
			const prefixScalar = this.PREFIX_VALUES[unit];

			if (prefixScalar !== undefined) {
				const next = terms[index + 1];

				if (next && this.isBaseUnitKey(next, rawValues)) {
					// * prefix on base unit: preserve in output
					own.push(unit);
				} else {
					// * prefix on derived unit or orphan: fold into scalar
					scalar = apply(scalar, prefixScalar);
				}

				continue;
			}

			const value = rawValues[unit];

			if (!value) continue;

			// * base unit, or a cycle we must break: keep the term as-is
			if (this.isBaseUnitKey(unit, rawValues) || visiting.has(unit)) {
				scalar = apply(scalar, value.scalar);

				own.push(unit);

				continue;
			}

			// * non-base unit: recursively expand
			visiting.add(unit);

			const expanded = this.expandRawToBase(
				value.numerator,
				value.denominator,
				rawValues,
				visiting,
			);

			visiting.delete(unit);

			scalar = apply(
				scalar,
				multiplySafely(value.scalar, expanded.scalar),
			);

			// * recursion's own side stays, its opposite side swaps
			own.push(...expanded.numerator);
			swap.push(...expanded.denominator);
		}

		return scalar;
	}

	private build(): void {
		this.PREFIX_VALUES = Object.create(null);
		this.PREFIX_MAP = Object.create(null);
		this.UNIT_VALUES = Object.create(null);
		this.UNIT_MAP = Object.create(null);
		this.OUTPUT_MAP = Object.create(null);

		const rawUnitValues: Record<Key, UnitValue> = Object.create(null);

		for (const key of objectKeys(this._units)) {
			if (!Object.hasOwn(this._units, key)) continue;

			const tuple = this._units[key];

			if (!tuple) continue;

			if (tuple.length === 3) {
				const [aliases, scalar, kind] = tuple;

				if (kind === "") {
					for (const alias of aliases) this.UNIT_MAP[alias] = key;

					this.OUTPUT_MAP[key] = aliases[0];

					continue;
				}

				this.PREFIX_VALUES[key] = scalar;

				for (const alias of aliases) this.PREFIX_MAP[alias] = key;

				this.OUTPUT_MAP[key] = aliases[0];

				continue;
			}

			const [aliases, scalar, , numerator, denominator = UNITY_ARRAY] =
				tuple;

			rawUnitValues[key] = {
				scalar,
				numerator,
				denominator,
			};

			for (const alias of aliases) this.UNIT_MAP[alias] = key;

			const primaryAlias = aliases[0];

			if (primaryAlias) this.OUTPUT_MAP[key] = primaryAlias;
		}

		this.SORTED_PREFIXES = objectKeys(this.PREFIX_MAP).sort(
			(left, right) => right.length - left.length,
		);

		const rawKeys = objectKeys(rawUnitValues);

		// * pre-compute fully expanded base units for each unit
		for (const key of rawKeys) {
			const raw = rawUnitValues[key];

			if (!raw) continue;

			const expanded = this.expandRawToBase(
				raw.numerator,
				raw.denominator,
				rawUnitValues,
			);

			let absoluteScalar = multiplySafely(raw.scalar, expanded.scalar);

			for (const token of expanded.numerator) {
				const prefixValue = this.PREFIX_VALUES[token];

				if (prefixValue !== undefined)
					absoluteScalar = multiplySafely(
						absoluteScalar,
						prefixValue,
					);
			}

			for (const token of expanded.denominator) {
				const prefixValue = this.PREFIX_VALUES[token];

				if (prefixValue !== undefined)
					absoluteScalar = divideSafely(absoluteScalar, prefixValue);
			}

			this.UNIT_VALUES[key] = {
				scalar: absoluteScalar,
				numerator: expanded.numerator,
				denominator: expanded.denominator,
			};
		}
	}
}

/**
 * Default registry populated with built-in definitions.
 */
export const DEFAULT_REGISTRY: UnitRegistry = new UnitRegistry();

/**
 * Builds a cache key from `numerator` and `denominator`.
 */
function getUnitKey(
	numerator: readonly Numerator[],
	denominator: readonly Denominator[],
): string {
	return numerator.join(",") + "/" + denominator.join(",");
}

/**
 * Test whether a kind should be included in public unit listings.
 */
function notExcludedKind(kind: Kind): boolean {
	return !FILTERED_KINDS.includes(kind);
}

export default UnitRegistry;
