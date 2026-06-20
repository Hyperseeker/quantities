/**
 * @file Core type aliases and interfaces shared across the quantities package.
 */

import type Quantity from "./quantities/constructor.ts";

/**
 * Unit name.
 */
export type Name = string;

/**
 * Canonical unit key, conventionally wrapped in angled brackets (e.g. `<meter>`).
 *
 * TODO: type this via `UnitKey`, derived from `UNITS` keys. The blocker is the
 * circular dependency: `Numerator` and `Denominator` must also be typed as
 * `UnitKey` (not a hypothetical `BaseUnitKey`), since some units explicitly use
 * e.g. `<foot>`, `<count>`, or `<1>`. This requires a way to guarantee the
 * `UNITS` shape while deriving all alias-relevant values from it.
 */
export type Key = `<${string}>`;

/**
 * Alias recognized by the parser.
 */
export type Alias = string;

/**
 * Aliases for a unit; the first alias is the default output name.
 */
export type Aliases = NonEmptyArray<Alias>;

/**
 * Numeric scalar multiplier.
 */
export type Scalar = number;

/**
 * Domain-specific kind (e.g. "length", "power").
 */
export type Kind = string;

/**
 * Unit key appearing in a numerator.
 */
export type Numerator = Key;

/**
 * Unit key appearing in a denominator.
 */
export type Denominator = Key;

/**
 * String of aliases.
 * @example "meter s s"
 */
export type UnitString = string;

/**
 * Map of canonical keys to their internal tuples.
 */
export type UnitMap = Record<Key, UnitTuple>;

/**
 * Internal unit tuple used to store raw definitions.
 * - [0] aliases (first alias is the default output name)
 * - [1] scalar relative to its decomposition (or 1 for base units)
 * - [2] kind; the literal "prefix" marks a prefix definition
 * - [3] numerator decomposition (array of canonical keys) if derived unit
 * - [4] denominator decomposition (array of canonical keys) if derived unit
 *
 * This is primarily an internal representation; prefer {@link UnitEntry} for registration.
 */
export type UnitTuple =
	// * hardcoded unity unit tuple
	| [alias: ["1", "<1>"], scalar: 1, kind: ""]
	| [alias: Aliases, scalar: Scalar, kind: "prefix"]
	| [
			alias: Aliases,
			scalar: Scalar,
			kind: Kind,
			numerator: NonEmptyArray<Numerator>,
			denominator?: NonEmptyArray<Denominator>,
	  ];

/**
 * Quantity expressed as a string (e.g. "1 m/s").
 */
export type QuantityString = string;

/**
 * Accepted inputs for constructing a quantity.
 */
export type QuantityInitializer =
	| QuantityString
	| number
	| Quantity
	| DefinitionObject;

/**
 * Formatter function.
 */
export type Formatter = (scalar: number, units: string) => string;

/**
 * Non-empty array: an array with at least one item.
 */
export type NonEmptyArray<T> = readonly [T, ...T[]];

/**
 * Fully specified unit vector with non-empty numerator and denominator.
 */
export interface UnitValue {
	scalar: Scalar;
	numerator: NonEmptyArray<Numerator>;
	denominator: NonEmptyArray<Denominator>;
}

/**
 * Result of expanding a unit vector to base units.
 * Unlike {@link UnitValue}, numerator and denominator may be empty when the expansion resolves to unity on one side (e.g. Hertz → `[]` / `[<second>]`).
 */
export interface ExpandedUnitValue {
	scalar: Scalar;
	numerator: readonly Numerator[];
	denominator: readonly Denominator[];
}

/**
 * User-facing entry for registering a unit.
 *
 * The first alias in `aliases` becomes the default output name used during formatting.
 *
 * If `numerator` and `denominator` are both omitted, the unit is considered base (its own base decomposition).
 */
export interface UnitEntry {
	/** Canonical key. Conventionally must be wrapped in angled brackets. */
	key: Key;
	/** Aliases recognized by the parser. First alias is the default output name. */
	aliases: Aliases;
	/** Scalar relative to the unit's base decomposition. Must be a finite number. */
	scalar: Scalar;
	/** Domain-specific kind (e.g. "length", "power"). Not used for prefixes. */
	kind: Kind;
	/** Numerator unit keys of the base decomposition, if derived. */
	numerator?: NonEmptyArray<Numerator>;
	/** Denominator unit keys of the base decomposition, if derived. */
	denominator?: NonEmptyArray<Denominator>;
}

/**
 * User-facing entry for registering a prefix.
 */
export interface PrefixEntry {
	/** Canonical key. */
	key: Key;
	/** Aliases recognized by the parser. First alias is the default output name. */
	aliases: Aliases;
	/** Numeric multiplier for the prefix. Must be a finite number. */
	scalar: Scalar;
}

/**
 * Definition object used to construct a quantity directly.
 *
 * `numerator` and `denominator` accept plain arrays (possibly empty).
 * The `Quantity` constructor normalizes missing or empty term lists to `UNITY_ARRAY`, so callers that build terms incrementally don't need to pre-check emptiness.
 */
export interface DefinitionObject {
	scalar: Scalar;
	numerator?: readonly Numerator[];
	denominator?: readonly Denominator[];
}

/**
 * Quantity extension shape.
 */
export interface QuantityExtension {
	/** Key of the provided method. */
	name: string;
	/**
	 * Method to extend {@link Quantity} with. Called with `Quantity().[name]`.
	 *
	 * `never[]` args make any concretely-typed method assignable to this contract;
	 * the real signature is recovered by `ExtractMethods` from the passed value.
	 */
	method: (this: Quantity, ...args: never[]) => unknown;
}
