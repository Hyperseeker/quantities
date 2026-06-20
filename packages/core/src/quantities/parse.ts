/**
 * @file Parses quantity strings into `Quantity` state.
 */

import type { Denominator, Key, Numerator, QuantityString } from "../types.ts";
import { isNonEmptyArray } from "../utils.ts";
import type Quantity from "./constructor.ts";
import { QuantityError } from "./error.ts";
import { isString } from "./predicates.ts";
import type UnitRegistry from "./registry.ts";

/**
 * A single extracted scalar/unit pair.
 */
type Pair = [
	fullMatch: string,
	scalar: string | undefined,
	unit: string | undefined,
];

/**
 * Tokens of a parsed exponent expression, split by exponent sign.
 */
interface ExponentResult {
	positive: Key[];
	negative: Key[];
	remainder: string;
}

/**
 * Sign character class.
 */
const SIGN = "[+-]";

/**
 * One or more digits.
 */
const INTEGER = "\\d+";

/**
 * Optionally signed integer.
 */
const SIGNED_INTEGER = SIGN + "?" + INTEGER;

/**
 * Decimal fraction.
 */
const FRACTION = "\\." + INTEGER;

/**
 * Unsigned floating-point number.
 */
const FLOAT = "(?:" + INTEGER + "(?:" + FRACTION + ")?|" + FRACTION + ")";

/**
 * Scientific-notation exponent.
 *
 * @example `e-3`
 */
const EXPONENT = "[Ee]" + SIGNED_INTEGER;

/**
 * Unsigned number in scientific notation.
 */
const SCIENTIFIC_NOTATION_NUMBER =
	"(?:" + FLOAT + ")(?![Ee][+-](?!\\d))(?:" + EXPONENT + ")?";

/**
 * Optionally signed scientific number.
 */
const SIGNED_NUMBER = "(?:" + SIGN + "\\s*)?" + SCIENTIFIC_NOTATION_NUMBER;

/**
 * Full quantity string grammar: scalar, numerator, optional denominator.
 */
const QUANTITY_STRING =
	"\\s*(" +
	SIGNED_NUMBER +
	")?\\s*" +
	"([^/]*[^/\\s]|)" +
	"(?:/([^/\\s][^/]*))?";

/**
 * Anchored matcher for a complete quantity string.
 */
const QUANTITY_STRING_REGEX = new RegExp("^" + QUANTITY_STRING + "$");

/**
 * First character of a unit token (not a digit, space, dot, or sign).
 */
const UNIT_START = "[^\\d\\s.+-]";

/**
 * A single unit token.
 */
const UNIT_TOKEN = UNIT_START + "[^\\s]*";

/**
 * A product of unit tokens separated by whitespace.
 */
const UNIT_EXPRESSION = UNIT_TOKEN + "(?:\\s+" + UNIT_TOKEN + ")*";

/**
 * Matches successive scalar/unit pairs in additive multi-pair input.
 */
const PAIR_REGEX = new RegExp(
	"(?:(" +
		SIGNED_NUMBER +
		")(?:\\s*(" +
		UNIT_EXPRESSION +
		"))?|(" +
		UNIT_EXPRESSION +
		"))" +
		"(?=\\s+(?:[+-]\\s*)*\\d|\\s+\\.\\d|\\s+" +
		UNIT_START +
		"|\\s*$)",
	"g",
);

/**
 * Power operator.
 */
const POWER_OPERATOR = "\\^|\\*{2}";

/**
 * Supported exponent magnitude (0–4).
 */
const SAFE_POWER = "[0-4]";

/**
 * Matches numerator units with positive or negative exponents.
 */
const NUMERATOR_REGEX = new RegExp(
	"([^ \\*\\d]+?)(?:" +
		POWER_OPERATOR +
		")?(-?" +
		SAFE_POWER +
		"(?![a-zA-Z]))",
	"g",
);
/**
 * Matches denominator units with positive exponents.
 */
const DENOMINATOR_REGEX = new RegExp(
	"([^ \\*\\d]+?)(?:" +
		POWER_OPERATOR +
		")?(?<!-)(" +
		SAFE_POWER +
		"(?![a-zA-Z]))",
	"g",
);

/**
 * Quick test for any exponent pattern in a numerator expression.
 */
const HAS_EXPONENT_NUMERATOR = /\^|\*\*|(?:^|[\s*])[^ *\d]+-?[0-4](?![A-Za-z])/;

/**
 * Quick test for any exponent pattern in a denominator expression.
 */
const HAS_EXPONENT_DENOMINATOR = /\^|\*\*|(?:^|[\s*])[^ *\d]+[0-4](?![A-Za-z])/;

// * character code for use with `.charCodeAt()`
/**
 * Character code of `-`.
 */
const CHAR_MINUS = 45;

/**
 * Character code of `0`.
 */
const CHAR_ZERO = 48;

/**
 * Per-registry cache of the multi-pair detection heuristic.
 */
const HEURISTICS_CACHE = new WeakMap<UnitRegistry, RegExp>();

/**
 * Whether `text` contains an exponent pattern matched by `regex`.
 */
function hasExponent(text: string, regex: RegExp): boolean {
	return regex.test(text);
}

/**
 * Collects the distinct non-alphanumeric characters that end any unit alias.
 */
function getUnitEndingChars(registry: UnitRegistry): string[] {
	return [
		...new Set(
			Object.values(registry.units)
				.flatMap((tuple) => tuple[0])
				.map((alias) => alias.at(-1)!)
				.filter((character) => !/[A-Za-z0-4]/.test(character)),
		),
	];
}

/**
 * Builds the regex used to cheaply detect additive multi-pair input for a registry.
 */
function buildMultiPairHeuristic(registry: UnitRegistry): RegExp {
	const specialChars = getUnitEndingChars(registry);

	const escaped = specialChars
		.map((character) => character.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&"))
		.join("");

	return new RegExp(`[a-zA-Z${escaped}]-?[0-4]?\\s+[+-]?\\d`);
}

/**
 * Returns the cached multi-pair heuristic for a registry, building it on first use.
 */
function getMultiPairHeuristic(registry: UnitRegistry): RegExp {
	let heuristic = HEURISTICS_CACHE.get(registry);

	if (!heuristic) {
		heuristic = buildMultiPairHeuristic(registry);

		HEURISTICS_CACHE.set(registry, heuristic);
	}

	return heuristic;
}

/**
 * Whether `input` contains two or more additive scalar/unit pairs.
 */
function isMultiPair(input: string, registry: UnitRegistry): boolean {
	const heuristic = getMultiPairHeuristic(registry);

	if (!heuristic.test(input)) return false;

	PAIR_REGEX.lastIndex = 0;

	if (!PAIR_REGEX.exec(input)) return false;

	return !!PAIR_REGEX.exec(input);
}

/**
 * Extracts every scalar/unit pair from additive multi-pair input.
 */
function extractUnitPairs(input: string): Pair[] {
	PAIR_REGEX.lastIndex = 0;

	const results: Pair[] = [];

	let match: RegExpExecArray | null;

	while ((match = PAIR_REGEX.exec(input)) !== null) {
		const scalar = match[1];
		const unit = match[2] ?? match[3];

		results.push([match[0], scalar, unit]);
	}

	return results;
}

/**
 * Parses exponent forms from a unit expression, returning tokens split by sign.
 *
 * @param text Unit expression to parse (e.g. "m2 s-2").
 * @param regex Regex matching exponent patterns (TOP_REGEX or BOTTOM_REGEX).
 * @param allowNegative Whether to handle negative exponents.
 * @param getUnitTokens Resolves a unit expression to tokens.
 * @param isValidUnitProduct Validates zero-exponent expressions.
 *
 * @returns Tokens split by exponent sign.
 *
 * @throws {QuantityError} if a unit expression is malformed or unrecognized.
 */
function processExponents(
	text: string,
	regex: RegExp,
	allowNegative: boolean,
	getUnitTokens: (expression: string) => Key[],
	isValidUnitProduct: (expression: string) => boolean,
): ExponentResult {
	regex.lastIndex = 0;

	const positive: Key[] = [];
	const negative: Key[] = [];
	const remainderParts: string[] = [];

	let cursor = 0;
	let match: RegExpExecArray | null;

	while ((match = regex.exec(text)) !== null) {
		const fullMatch = match[0];
		const expression = match[1];
		const exponent = match[2];

		if (!expression || !exponent)
			throw new QuantityError(
				"processExponents(): Invalid unit expression format",
			);

		if (match.index > cursor)
			remainderParts.push(text.slice(cursor, match.index));

		cursor = match.index + fullMatch.length;

		const isNegative =
			allowNegative && exponent.charCodeAt(0) === CHAR_MINUS;

		// * convert strings `"0"` through `"4"` to numbers `0` through `4`
		// * offset character by one if expression is negative to account for the minus sign
		const degree = exponent.charCodeAt(+isNegative) - CHAR_ZERO;

		if (degree === 0) {
			if (!isValidUnitProduct(expression))
				throw new QuantityError(
					"processExponents(): Unit not recognized",
				);

			continue;
		}

		const target = isNegative ? negative : positive;

		target.push(
			...Array.from({ length: degree }, () =>
				getUnitTokens(expression),
			).flat(),
		);
	}

	if (cursor < text.length) remainderParts.push(text.slice(cursor));

	return {
		positive,
		negative,
		remainder: remainderParts.join(" ").trim(),
	};
}

/**
 * Parses additive multi-pair input, summing each pair into the first pair's units (e.g. "1 m 20 cm").
 * Each pair keeps its own denominator, so "1 m 20 m/s" throws on incompatible units.
 *
 * @param input Full input string.
 *
 * @throws {QuantityError} if pairs have incompatible signatures or contain temperature units.
 *
 * @example
 * parseMultiPair("1 m 20 cm") // => 1.2 m
 * parseMultiPair("1 m/s 20 cm/s") // => 1.2 m/s
 * parseMultiPair("1 m 20 m/s") // => throws "Incompatible units"
 */
function parseMultiPair(this: Quantity, input: string): void {
	const pairs = extractUnitPairs(input);

	if (!pairs.length)
		throw new QuantityError(
			"parseMultiPair(): " + input + ": No valid pairs found",
		);

	const [, firstScalarString, firstUnit] = pairs[0]!;

	if (!firstUnit)
		throw new QuantityError(
			"parseMultiPair(): " + input + ": Invalid pair format",
		);

	const firstPairInput = `${firstScalarString || "1"} ${firstUnit}`;

	const firstQuantity = new (this.constructor as typeof Quantity)(
		firstPairInput,
	);

	this.scalar = firstQuantity.scalar;
	this.numerator = firstQuantity.numerator;
	this.denominator = firstQuantity.denominator;
	this.baseScalar = firstQuantity.baseScalar;
	this.signature = firstQuantity.signature;

	if (this.isTemperature())
		throw new QuantityError(
			"parseMultiPair(): Multi-pair input cannot contain temperature units (tempC, tempK, tempF). Use degree units (degC, degK, degF) for temperature differences.",
		);

	const firstSignature = this.signature;

	const firstUnitToBase =
		this.scalar !== 0 ? this.baseScalar / this.scalar : this.baseScalar;

	for (let index = 1; index < pairs.length; index++) {
		const [, pairScalarString, pairUnitString] = pairs[index]!;

		if (!pairUnitString)
			throw new QuantityError(
				"parseMultiPair(): " + input + ": Invalid pair format",
			);

		const tempInput = `${pairScalarString || "1"} ${pairUnitString}`;

		const tempQuantity = new (this.constructor as typeof Quantity)(
			tempInput,
		);

		if (tempQuantity.isTemperature())
			throw new QuantityError(
				"parseMultiPair(): Multi-pair input cannot contain temperature units",
			);

		if (tempQuantity.signature !== firstSignature)
			throw new QuantityError(
				`parseMultiPair(): Incompatible units in multi-pair: ${firstUnit} and ${pairUnitString}`,
			);

		if (firstUnitToBase !== 0) {
			const pairInFirstUnits = tempQuantity.baseScalar / firstUnitToBase;

			this.scalar += pairInFirstUnits;
		} else {
			const pairScalar = pairScalarString
				? Number.parseFloat(pairScalarString.replace(/\s/g, ""))
				: 1;

			this.scalar += pairScalar;
		}
	}
}

/**
 * Parses a string as a quantity.
 *
 * @param value Quantity as text.
 *
 * @returns Parsed quantity, or `null` if unrecognized.
 *
 * @throws {QuantityError} if the argument is not a string.
 */
export function globalParse(
	this: typeof Quantity,
	value: QuantityString,
): Quantity | null {
	if (!isString(value))
		throw new QuantityError("globalParse(): Argument must be a string");

	try {
		return new this(value);
	} catch {
		return null;
	}
}

/**
 * Parses a string or number into the current quantity instance (mutating this).
 *
 * @throws {QuantityError} if the input is an invalid numeric value or an unrecognized quantity.
 *
 * @example
 * "5.6 kg*m/s^2"
 * "2.2 kPa"
 * "37 degC"
 * "1" or 1 (unitless)
 * "GPa" (scalar defaults to 1)
 */
export default function parse(
	this: Quantity,
	value: QuantityString | number,
): void {
	const input = isString(value) ? value.trim() : value.toString();

	if (isMultiPair(input, this.registry))
		return parseMultiPair.call(this, input);

	const match = QUANTITY_STRING_REGEX.exec(input);

	if (!match)
		throw new QuantityError(
			"parse(): " + input + ": Quantity not recognized",
		);

	const [, scalar, top, bottom] = match;

	if (!scalar && top && /^[+-]{2,}\s*\d/.test(top))
		throw new QuantityError("parse(): Invalid numeric value: " + input);

	if (scalar) {
		// * avoid global replace when not needed
		if (scalar.includes(" ") || scalar.includes("\t")) {
			this.scalar = Number.parseFloat(scalar.replace(/\s/g, ""));
		} else {
			this.scalar = Number.parseFloat(scalar);
		}
	} else {
		this.scalar = 1;
	}

	const numeratorTokens: Numerator[] = [];
	const denominatorTokens: Denominator[] = [];
	const registry = this.registry;

	const tokenCache = new Map<string, Key[]>();

	const getUnitTokens = (expression: string): Key[] => {
		let tokens = tokenCache.get(expression);

		if (!tokens) {
			tokens = registry.parseUnits(expression);

			tokenCache.set(expression, tokens);
		}

		return tokens;
	};

	const isValid = registry.isValidUnitProduct.bind(registry);

	// * if there are no exponent operators/patterns, resolve the whole side
	if (top) {
		if (hasExponent(top, HAS_EXPONENT_NUMERATOR)) {
			const { positive, negative, remainder } = processExponents(
				top,
				NUMERATOR_REGEX,
				true,
				getUnitTokens,
				isValid,
			);

			numeratorTokens.push(...positive);
			denominatorTokens.push(...negative);

			if (remainder) numeratorTokens.push(...getUnitTokens(remainder));
		} else {
			const trimmed = top.trim();

			if (trimmed.length) numeratorTokens.push(...getUnitTokens(trimmed));
		}
	}

	if (bottom) {
		if (hasExponent(bottom, HAS_EXPONENT_DENOMINATOR)) {
			const { positive, remainder } = processExponents(
				bottom,
				DENOMINATOR_REGEX,
				false,
				getUnitTokens,
				isValid,
			);

			denominatorTokens.push(...positive);

			if (remainder) denominatorTokens.push(...getUnitTokens(remainder));
		} else {
			const trimmed = bottom.trim();

			if (trimmed.length)
				denominatorTokens.push(...getUnitTokens(trimmed));
		}
	}

	if (isNonEmptyArray(numeratorTokens)) this.numerator = numeratorTokens;
	if (isNonEmptyArray(denominatorTokens))
		this.denominator = denominatorTokens;
}
