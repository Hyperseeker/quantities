/**
 * @file Arithmetic and algebraic operators over quantities.
 */

import type { Denominator, Key, NonEmptyArray, Numerator } from "../types.ts";
import { objectEntries } from "../utils.ts";
import type Quantity from "./constructor.ts";
import { ensureQuantity, isQuantity } from "./constructor.ts";
import { IncompatibleUnitsError, QuantityError } from "./error.ts";
import {
	addSafely,
	divideSafely,
	multiplySafely,
	subtractSafely,
} from "./math.ts";
import { isNumber, isString, isUnity, isUnityArray } from "./predicates.ts";
import type UnitRegistry from "./registry.ts";
import { TEMPERATURE_SIGNATURE } from "./signature.ts";
import { snap } from "./snap.ts";
import {
	addTemperatureDegrees,
	subtractTemperatureDegrees,
	subtractTemperatures,
} from "./temperature.ts";
import { SI_BASE_UNITS, UNITY_ARRAY } from "./units.ts";

/**
 * Result of combining unit terms.
 */
type CleanedTerms = [
	numerator: readonly Numerator[],
	denominator: readonly Denominator[],
	scaleFactor: number,
];

/**
 * A counted unit pair (`unit` or `prefix + unit`) used when tallying terms.
 */
interface UnitPair {
	pair: NonEmptyArray<Key>;
	count: number;
}

/**
 * Candidate SI prefix with its value and the scalar it would produce.
 */
interface PrefixCandidate {
	key: Key | null;
	value: number;
	scalar: number;
}

/**
 * Derived SI prefix with the scalar adjusted to that prefix.
 */
interface DerivedPrefix {
	prefix: Key | null;
	scalar: number;
}

/**
 * Combined unit term with count, prefix info, and scale factors.
 */
interface CombinedTerm {
	count: number;
	unitKey: Key;
	prefix?: Key;
	numeratorScale: number;
	denominatorScale: number;
}

/**
 * Epsilon value for prefix derivation.
 */
const EPSILON = 1e-10;

/**
 * Computes the nth root of a value.
 */
function nthRoot(value: number, power: number): number {
	if (power === 2) return Math.sqrt(value);
	if (power === 3) return Math.cbrt(value);
	if (value < 0 && power % 2 === 1) return -nthRoot(-value, power);

	return Math.pow(value, 1 / power);
}

/**
 * Repeats unit terms for exponentiation, returning an empty array when the result would be unity.
 *
 * @param terms Unit terms to repeat.
 * @param times Number of repetitions.
 *
 * @returns The repeated terms, or an empty array when the result is unity.
 */
function repeat(terms: readonly Key[], times: number): readonly Key[] {
	if (times === 0 || isUnityArray(terms)) return [];

	return Array.from({ length: times }, () => terms).flat();
}

/**
 * Counts occurrences of unit tokens, combining prefix+unit pairs.
 *
 * @param terms Unit tokens, which may include prefix tokens.
 * @param registry Unit registry used to check whether a token is a prefix.
 *
 * @returns Map of unit pairs to their count.
 */
function countUnitPairs(
	terms: readonly Key[],
	registry: UnitRegistry,
): Map<string, UnitPair> {
	if (isUnityArray(terms)) return new Map();

	return terms.reduce((counts, token, index) => {
		const prevToken = terms[index - 1];

		// * skip if this token was consumed as the unit of a prefix
		if (prevToken && registry.isPrefix(prevToken)) return counts;

		const nextToken = terms[index + 1];

		// * skip orphaned prefix
		if (!nextToken && registry.isPrefix(token)) return counts;

		const isPrefixWithUnit = nextToken && registry.isPrefix(token);

		// TODO: type this cleaner
		const pair = isPrefixWithUnit
			? ([token, nextToken] as const as [Key, Key])
			: ([token] as const as [Key]);

		const key = isPrefixWithUnit ? `${token}|${nextToken}` : token;
		const current = counts.get(key);

		if (current) current.count += 1;
		else counts.set(key, { pair, count: 1 });

		return counts;
	}, new Map<string, UnitPair>());
}

/**
 * Builds unit terms by repeating each pair the appropriate number of times.
 *
 * @param counts Map of unit pairs and their counts.
 * @param divisor Optional divisor to divide counts by (for root operations).
 *
 * @returns The expanded unit terms, or an empty array when no terms remain.
 */
function buildTermsFromCounts(
	counts: Map<string, UnitPair>,
	divisor = 1,
): readonly Key[] {
	return Array.from(counts.values()).flatMap(({ pair, count }) => {
		const length = count / divisor;

		return Array.from({ length }, () => pair).flat();
	});
}

/**
 * Expands unit tokens one level by looking up their definitions in the registry.
 * Prefixes contribute to the scalar and are removed from the token list.
 *
 * @param numerator Current numerator tokens.
 * @param denominator Current denominator tokens.
 * @param registry Unit registry for definition lookups.
 *
 * @returns Object with expanded units and scalar factor.
 */
function expandUnits(
	numerator: readonly Numerator[],
	denominator: readonly Denominator[],
	registry: UnitRegistry,
): {
	scalar: number;
	numerator: readonly Numerator[];
	denominator: readonly Denominator[];
} {
	let scalar = 1;

	const expandedNumerator: Numerator[] = [];
	const expandedDenominator: Denominator[] = [];

	for (const token of numerator) {
		if (isUnity(token)) continue;

		const definition = registry.units[token];

		if (!definition) {
			expandedNumerator.push(token);

			continue;
		}

		const [, defScalar, kind, defNumerator, defDenominator] = definition;

		if (kind === "prefix") {
			scalar *= defScalar;

			continue;
		}

		// * base unit: self-referential definition
		if (
			defNumerator?.length === 1 &&
			defNumerator[0] === token &&
			!defDenominator?.length
		) {
			expandedNumerator.push(token);

			continue;
		}

		// * derived unit: expand to definition
		scalar *= defScalar;

		if (defNumerator) expandedNumerator.push(...defNumerator);
		if (defDenominator) expandedDenominator.push(...defDenominator);
	}

	for (const token of denominator) {
		if (isUnity(token)) continue;

		const definition = registry.units[token];

		if (!definition) {
			expandedDenominator.push(token);

			continue;
		}

		const [
			,
			definitionScalar,
			kind,
			definitionNumerator,
			definitionDenominator,
		] = definition;

		if (kind === "prefix") {
			scalar /= definitionScalar;

			continue;
		}

		// * base unit: self-referential definition
		if (
			definitionNumerator?.length === 1 &&
			definitionNumerator[0] === token &&
			!definitionDenominator?.length
		) {
			expandedDenominator.push(token);

			continue;
		}

		// * derived unit: expand to definition
		// * definition's denominator goes to numerator
		scalar /= definitionScalar;

		if (definitionNumerator)
			expandedDenominator.push(...definitionNumerator);
		if (definitionDenominator)
			expandedNumerator.push(...definitionDenominator);
	}

	return {
		scalar,
		numerator: expandedNumerator.length ? expandedNumerator : UNITY_ARRAY,
		denominator: expandedDenominator.length
			? expandedDenominator
			: UNITY_ARRAY,
	};
}

/**
 * Enumerates SI prefix candidates for a given base scalar and unit power.
 * Each candidate includes the adjusted scalar when that prefix is applied.
 *
 * @param baseScalar The scalar in base (unprefixed) units.
 * @param power The unit power (e.g. 2 for area, 3 for volume).
 * @param registry The unit registry to get prefixes from.
 * @param stride Include only prefixes whose log10 is a multiple of this value (1 = all integer-power prefixes, 3 = engineering notation only).
 *
 * @returns Candidates sorted by prefix value descending, including a "no prefix" option.
 */
function getPrefixCandidates(
	baseScalar: number,
	power: number,
	registry: UnitRegistry,
	stride = 1,
): PrefixCandidate[] {
	const candidates: PrefixCandidate[] = objectEntries(registry.units)
		.filter(([, [, scalar, type]]) => {
			if (type !== "prefix") return false;

			const exponent = Math.log10(scalar);

			return Number.isInteger(exponent) && exponent % stride === 0;
		})
		.map(([key, [, value]]) => ({
			key,
			value,
			scalar: divideSafely(baseScalar, Math.pow(value, power)),
		}))
		.sort((left, right) => right.value - left.value);

	candidates.push({
		key: null,
		value: 1,
		scalar: baseScalar,
	});

	return candidates;
}

/**
 * Derives the appropriate SI prefix for a scalar value.
 *
 * @param rootScalar The scalar after computing the root.
 * @param registry The unit registry to get prefixes from.
 *
 * @returns Object with prefix key (or null for no prefix) and adjusted scalar.
 */
function derivePrefix(
	rootScalar: number,
	registry: UnitRegistry,
): DerivedPrefix {
	const candidates = getPrefixCandidates(rootScalar, 1, registry);

	for (const { key, scalar, value } of candidates) {
		if (value < 1 && rootScalar >= 1 - EPSILON)
			return { prefix: null, scalar: rootScalar };

		if (scalar >= 1 - EPSILON) return { prefix: key, scalar };
	}

	const smallest = candidates.at(-2); // last prefix before the "no prefix" entry

	return smallest
		? { prefix: smallest.key, scalar: smallest.scalar }
		: { prefix: null, scalar: rootScalar };
}

/**
 * Checks if all unit counts are divisible by the given exponent.
 *
 * @param numeratorCounts Map of numerator unit pairs and counts.
 * @param denominatorCounts Map of denominator unit pairs and counts.
 * @param exponent The root exponent to check divisibility against.
 *
 * @returns `true` if all counts are divisible by exponent.
 */
function areCountsDivisible(
	numeratorCounts: Map<string, UnitPair>,
	denominatorCounts: Map<string, UnitPair>,
	exponent: number,
): boolean {
	// * `[...Map]` has comparable performance to `Array.from(Map)`
	const allNumeratorsDivisible = [...numeratorCounts.values()].every(
		({ count }) => count % exponent === 0,
	);
	const allDenominatorsDivisible = [...denominatorCounts.values()].every(
		({ count }) => count % exponent === 0,
	);

	return allNumeratorsDivisible && allDenominatorsDivisible;
}

/**
 * Computes the `n`-th root of a scalar.
 *
 * @throws {QuantityError} if result is non-finite.
 */
function computeRootScalar(value: number, exponent: number): number {
	const result = nthRoot(value, exponent);

	if (!Number.isFinite(result))
		throw new QuantityError(
			"computeRootScalar(): Invalid root: result is not finite",
		);

	return snap(result);
}

/**
 * Combines unit terms into a map, tracking counts and scale factors.
 *
 * @param registry The unit registry for prefix lookups
 * @param combined The map to update (mutated)
 * @param terms Array of unit/prefix tokens to process
 * @param direction 1 for numerator, -1 for denominator
 */
function combineTermsIntoMap(
	registry: UnitRegistry,
	combined: Record<string, CombinedTerm>,
	terms: readonly Key[],
	direction: 1 | -1,
): void {
	for (let index = 0; index < terms.length; index++) {
		// * we know `term` is available because we bind the index by the length of `terms`
		const term = terms[index]!;
		const nextTerm = terms[index + 1];
		const isPrefix = registry.isPrefix(term);

		if (isPrefix && !nextTerm)
			throw new QuantityError(
				`combineTermsIntoMap(): Invalid unit expression: prefix \`${term}\` must be followed by a unit`,
			);

		const hasPrefix = isPrefix && nextTerm;
		const unitKey = hasPrefix ? nextTerm : term;
		const prefix = hasPrefix ? term : undefined;
		const prefixValue = hasPrefix ? registry.getPrefixValue(term) : 1;

		// * skip consumed unit token
		if (hasPrefix) index++;

		if (isUnity(unitKey)) continue;

		const existing = combined[unitKey];

		if (!existing) {
			combined[unitKey] = {
				count: direction,
				unitKey,
				prefix,
				numeratorScale: 1,
				denominatorScale: 1,
			};

			continue;
		}

		existing.count += direction;

		const combinedPrefixValue = existing.prefix
			? registry.getPrefixValue(existing.prefix)
			: 1;

		existing[direction === 1 ? "numeratorScale" : "denominatorScale"] *=
			divideSafely(prefixValue, combinedPrefixValue);
	}
}

/**
 * Build the final numerator and denominator arrays from combined terms.
 *
 * @param combined Record of combined unit terms with their counts and scales.
 *
 * @returns `[numerator terms, denominator terms, overall scale factor]`.
 */
function buildOutputArrays(
	combined: Record<string, CombinedTerm>,
): CleanedTerms {
	const numeratorTerms: Numerator[] = [];
	const denominatorTerms: Denominator[] = [];

	let factor = 1;

	for (const {
		count,
		unitKey,
		prefix,
		numeratorScale,
		denominatorScale,
	} of Object.values(combined)) {
		const target = count > 0 ? numeratorTerms : denominatorTerms;
		const unit = prefix ? [prefix, unitKey] : [unitKey];

		target.push(
			...Array.from({ length: Math.abs(count) }, () => unit).flat(),
		);

		factor *= divideSafely(numeratorScale, denominatorScale);
	}

	return [numeratorTerms, denominatorTerms, factor];
}

/**
 * Combines and simplifies unit terms from two quantities' numerators/denominators.
 * Cancels common terms and tracks prefix scale adjustments.
 *
 * @returns `[numerator terms, denominator terms, overall scale factor]`
 */
function cleanTerms(
	registry: UnitRegistry,
	numerator: NonEmptyArray<Numerator>,
	denominator: NonEmptyArray<Denominator>,
	otherNumerator: NonEmptyArray<Numerator>,
	otherDenominator: NonEmptyArray<Denominator>,
): CleanedTerms {
	const combined: Record<string, CombinedTerm> = {};

	combineTermsIntoMap(registry, combined, numerator, 1);
	combineTermsIntoMap(registry, combined, denominator, -1);
	combineTermsIntoMap(registry, combined, otherNumerator, 1);
	combineTermsIntoMap(registry, combined, otherDenominator, -1);

	return buildOutputArrays(combined);
}

/**
 * Adds two compatible quantities.
 *
 * If one operand is a temperature and the other is degrees, returns a temperature per classical thermodynamics rules.
 *
 * Adding two temperatures is forbidden.
 *
 * @throws {QuantityError} if trying to add two temperatures
 */
export function add(self: Quantity, other: string | Quantity): Quantity {
	const rhs = ensureQuantity(other, self);

	if (!self.isCompatible(rhs))
		throw new IncompatibleUnitsError(self.units(), rhs.units());

	if (self.isTemperature() && rhs.isTemperature()) {
		throw new QuantityError("add(): Cannot add two temperatures");
	} else if (self.isTemperature()) {
		return addTemperatureDegrees(self, rhs);
	} else if (rhs.isTemperature()) {
		return addTemperatureDegrees(rhs, self);
	}

	return new (self.constructor as typeof Quantity)({
		scalar: addSafely(self.scalar, rhs.toUnits(self).scalar),
		numerator: self.numerator,
		denominator: self.denominator,
	});
}

/**
 * Subtracts two quantities.
 *
 * Subtracting temperature from degrees is forbidden.
 *
 * @throws {QuantityError} if trying to subtract temperature from degrees.
 */
export function subtract(self: Quantity, other: string | Quantity): Quantity {
	const rhs = ensureQuantity(other, self);

	if (!self.isCompatible(rhs))
		throw new IncompatibleUnitsError(self.units(), rhs.units());

	if (self.isTemperature() && rhs.isTemperature()) {
		return subtractTemperatures(self, rhs);
	} else if (self.isTemperature()) {
		return subtractTemperatureDegrees(self, rhs);
	} else if (rhs.isTemperature()) {
		throw new QuantityError(
			"subtract(): Cannot subtract a temperature from a differential degree unit",
		);
	}

	return new (self.constructor as typeof Quantity)({
		scalar: subtractSafely(self.scalar, rhs.toUnits(self).scalar),
		numerator: self.numerator,
		denominator: self.denominator,
	});
}

/**
 * Multiplies a quantity by a number or another quantity.
 *
 * Multiplication by temperatures is only allowed if the other operand is unitless.
 *
 * @throws {QuantityError} if trying to multiply temperature by non-unitless value.
 */
export function multiply(
	self: Quantity,
	input: string | number | Quantity,
): Quantity {
	if (!isString(input) && !isNumber(input) && !isQuantity(input))
		throw new QuantityError(
			"multiply(): Invalid input for multiplication: expected string, number, or Quantity",
		);

	if (isNumber(input))
		return new (self.constructor as typeof Quantity)({
			scalar: multiplySafely(self.scalar, input),
			numerator: self.numerator,
			denominator: self.denominator,
		});

	const rhs = ensureQuantity(input, self);

	if (
		(self.isTemperature() || rhs.isTemperature()) &&
		!(self.isUnitless() || rhs.isUnitless())
	)
		throw new QuantityError("multiply(): Cannot multiply by temperatures");

	const compatible =
		self.isCompatible(rhs) && self.signature !== TEMPERATURE_SIGNATURE;

	let left: Quantity;
	let right: Quantity;

	// * when compatible, normalize both operands to the smaller unit so the result reads naturally
	// * e.g. 1 km × 1 mm → 1 000 000 mm²
	if (compatible) {
		const selfToBase = self.registry.expandToBase(
			self.numerator,
			self.denominator,
		).scalar;
		const rhsToBase = self.registry.expandToBase(
			rhs.numerator,
			rhs.denominator,
		).scalar;

		if (selfToBase <= rhsToBase) {
			left = self;
			right = rhs.toUnits(self);
		} else {
			left = self.toUnits(rhs);
			right = rhs;
		}
	} else {
		left = self;
		right = rhs;
	}

	const [numerator, denominator, scale] = cleanTerms(
		self.registry,
		left.numerator,
		left.denominator,
		right.numerator,
		right.denominator,
	);

	return new (self.constructor as typeof Quantity)({
		scalar: multiplySafely(
			scale,
			multiplySafely(left.scalar, right.scalar),
		),
		numerator,
		denominator,
	});
}

/**
 * Divides a quantity by a number or another quantity.
 *
 * Division with temperatures is forbidden unless dividing a temperature by a unitless number.
 *
 * @throws {QuantityError} on divide by zero or temperature misuse
 */
export function divide(
	self: Quantity,
	input: number | string | Quantity,
): Quantity {
	if (isNumber(input)) {
		if (input === 0)
			throw new QuantityError("divide(): Attempted to divide by zero");

		return new (self.constructor as typeof Quantity)({
			scalar: divideSafely(self.scalar, input),
			numerator: self.numerator,
			denominator: self.denominator,
		});
	}

	const rhs = ensureQuantity(input, self);

	if (rhs.scalar === 0)
		throw new QuantityError("divide(): Attempted to divide by zero");

	if (rhs.isTemperature() || (self.isTemperature() && !rhs.isUnitless()))
		throw new QuantityError("divide(): Cannot divide with temperatures");

	// * keep degree unit info in numerator/denominator for temperature calculations
	// * temperature units must not be converted to prevent loss of degree/absolute distinction
	const other =
		self.isCompatible(rhs) && self.signature !== TEMPERATURE_SIGNATURE
			? rhs.toUnits(self)
			: rhs;

	const [numerator, denominator, scale] = cleanTerms(
		self.registry,
		self.numerator,
		self.denominator,
		other.denominator,
		other.numerator,
	);

	return new (self.constructor as typeof Quantity)({
		scalar: divideSafely(multiplySafely(self.scalar, scale), other.scalar),
		numerator,
		denominator,
	});
}

/**
 * Inverts a quantity: `(1 / quantity)`.
 *
 * Not allowed for temperatures and zero values.
 *
 * @throws {QuantityError} on divide by zero or temperature misuse
 */
export function invert(self: Quantity): Quantity {
	if (self.isTemperature())
		throw new QuantityError("invert(): Cannot divide with temperatures");

	if (self.scalar === 0)
		throw new QuantityError("invert(): Attempted to divide by zero");

	return new (self.constructor as typeof Quantity)({
		// * snapping doesn't correct a lot of the float errors from this type of division, so we don't bother using `divideSafely()` here
		scalar: 1 / self.scalar,
		numerator: self.denominator,
		denominator: self.numerator,
	});
}

/**
 * Raises a quantity to a power.
 *
 * For quantities with units: power must be an integer.
 * Temperatures cannot be raised to negative powers and cannot be multiplied by themselves.
 */
export function exponent(self: Quantity, exponent: number): Quantity {
	if (!isNumber(exponent))
		throw new QuantityError("exponent(): Exponent must be a finite number");

	// * unitless quantities can accept any real exponent
	const unitless = self.isUnitless();

	if (!unitless && !Number.isInteger(exponent))
		throw new QuantityError(
			"exponent(): Non-integer exponent not allowed for quantities with units",
		);

	if (self.isTemperature()) {
		if (exponent < 0)
			throw new QuantityError(
				"exponent(): Cannot divide with temperatures",
			);

		if (exponent > 1)
			throw new QuantityError(
				"exponent(): Cannot multiply by temperatures",
			);
	}

	if (exponent === 0)
		return new (self.constructor as typeof Quantity)({
			scalar: 1,
			numerator: UNITY_ARRAY,
			denominator: UNITY_ARRAY,
		});

	let scalar: number;

	if (Number.isInteger(exponent)) {
		const extractedExponent = Math.abs(exponent);

		const accumulator = Array.from({
			length: extractedExponent,
		}).reduce<number>((result) => multiplySafely(result, self.scalar), 1);

		if (exponent >= 0) {
			scalar = accumulator;
		} else {
			if (self.scalar === 0)
				throw new QuantityError(
					"exponent(): Attempted to divide by zero",
				);

			scalar = 1 / accumulator;
		}
	} else {
		// * unitless, non-integer exponent
		if (self.scalar < 0)
			throw new QuantityError(
				"exponent(): Fractional exponent of a negative quantity is not supported",
			);

		scalar = Math.pow(self.scalar, exponent);

		if (!Number.isFinite(scalar))
			throw new QuantityError(
				"exponent(): Invalid exponent result: scalar is not finite",
			);
	}

	if (unitless)
		return new (self.constructor as typeof Quantity)({
			scalar,
			numerator: UNITY_ARRAY,
			denominator: UNITY_ARRAY,
		});

	const integer = Math.trunc(exponent);
	const absolute = Math.abs(integer);

	const numerator =
		integer >= 0
			? repeat(self.numerator, absolute)
			: repeat(self.denominator, absolute);

	const denominator =
		integer >= 0
			? repeat(self.denominator, absolute)
			: repeat(self.numerator, absolute);

	return new (self.constructor as typeof Quantity)({
		scalar,
		numerator,
		denominator,
	});
}

/**
 * Raises a quantity to the reciprocal power `1 / exponent`.
 *
 * Unitless quantities take the plain `n`-th root.
 * Quantities with units require every unit exponent to be divisible by `exponent`.
 *
 * @throws {QuantityError} on a non-positive-integer power, even root of a negative quantity, temperature roots, or non-divisible unit exponents.
 */
export function root(self: Quantity, exponent: number): Quantity {
	if (!isNumber(exponent) || !Number.isInteger(exponent) || exponent <= 0)
		throw new QuantityError(
			"root(): Root power must be a positive integer",
		);

	if (exponent === 1)
		return new (self.constructor as typeof Quantity)({
			scalar: self.scalar,
			numerator: self.numerator,
			denominator: self.denominator,
		});
	if (self.scalar < 0 && exponent % 2 === 0)
		throw new QuantityError(
			"root(): Even root of a negative quantity is not supported",
		);

	if (self.isUnitless()) {
		const scalar = computeRootScalar(self.scalar, exponent);

		return new (self.constructor as typeof Quantity)({
			scalar: scalar,
			numerator: UNITY_ARRAY,
			denominator: UNITY_ARRAY,
		});
	}

	if (self.isTemperature())
		throw new QuantityError(
			"root(): Invalid root: temperature units cannot have fractional exponents",
		);

	let numerator = [...self.numerator] as Numerator[];
	let denominator = [...self.denominator] as Denominator[];
	let accumulatedScalar = self.scalar;

	let numeratorCounts = countUnitPairs(numerator, self.registry);
	let denominatorCounts = countUnitPairs(denominator, self.registry);

	// * if surface units work, use them
	if (areCountsDivisible(numeratorCounts, denominatorCounts, exponent)) {
		const scalar = computeRootScalar(accumulatedScalar, exponent);

		return new (self.constructor as typeof Quantity)({
			scalar: scalar,
			numerator: buildTermsFromCounts(numeratorCounts, exponent),
			denominator: buildTermsFromCounts(denominatorCounts, exponent),
		});
	}

	let lastSignature = "";

	while (true) {
		const expanded = expandUnits(numerator, denominator, self.registry);

		accumulatedScalar *= expanded.scalar;
		// TODO: avoid expansion into itself?
		// * expansion is a clean way to type these values, but it costs CPU cycles
		numerator = [...expanded.numerator];
		denominator = [...expanded.denominator];

		const currentSignature = `${numerator.join(",")}|${denominator.join(",")}`;

		// * no change = base units reached
		if (currentSignature === lastSignature) break;

		lastSignature = currentSignature;

		numeratorCounts = countUnitPairs(numerator, self.registry);
		denominatorCounts = countUnitPairs(denominator, self.registry);

		if (areCountsDivisible(numeratorCounts, denominatorCounts, exponent)) {
			const rootScalar = computeRootScalar(accumulatedScalar, exponent);

			const resultNumerator = buildTermsFromCounts(
				numeratorCounts,
				exponent,
			);
			const resultDenominator = buildTermsFromCounts(
				denominatorCounts,
				exponent,
			);

			const hasSIBaseUnit =
				resultNumerator.some((key) =>
					SI_BASE_UNITS.includes(
						key as (typeof SI_BASE_UNITS)[number],
					),
				) ||
				resultDenominator.some((key) =>
					SI_BASE_UNITS.includes(
						key as (typeof SI_BASE_UNITS)[number],
					),
				);

			if (hasSIBaseUnit && resultNumerator.length > 0) {
				const { prefix, scalar: adjustedScalar } = derivePrefix(
					rootScalar,
					self.registry,
				);

				const prefixedNumerator: Numerator[] = [];

				for (const token of resultNumerator) {
					const isSIBase = SI_BASE_UNITS.includes(
						token as (typeof SI_BASE_UNITS)[number],
					);

					if (prefix && isSIBase)
						prefixedNumerator.push(prefix, token);
					else prefixedNumerator.push(token);
				}

				return new (self.constructor as typeof Quantity)({
					scalar: snap(adjustedScalar),
					numerator: prefixedNumerator,
					denominator: resultDenominator,
				});
			}

			return new (self.constructor as typeof Quantity)({
				scalar: rootScalar,
				numerator: resultNumerator,
				denominator: resultDenominator,
			});
		}
	}

	throw new QuantityError(
		`root(): Invalid root: unit exponents not divisible by ${exponent}`,
	);
}

/**
 * Returns the absolute value of a quantity.
 * The result is a new Quantity with the same units but positive scalar.
 *
 * @param self The quantity to take the absolute value of.
 *
 * @returns A new Quantity with positive scalar.
 *
 * @example
 * Quantity("-5 m").abs() // => 5 m
 * Quantity("-10 tempC").abs() // => 10 tempC
 */
export function abs(self: Quantity): Quantity {
	return new (self.constructor as typeof Quantity)({
		scalar: Math.abs(self.scalar),
		numerator: self.numerator,
		denominator: self.denominator,
	});
}

/**
 * Returns the sign of a quantity's scalar value.
 *
 * @param self The quantity to get the sign of.
 *
 * @returns -1 for negative, 0 for zero, 1 for positive.
 *
 * @example
 * Quantity("5 m").sign() // => 1
 * Quantity("-5 m").sign() // => -1
 * Quantity("0 m").sign() // => 0
 */
export function sign(self: Quantity): number {
	return Math.sign(self.scalar);
}
