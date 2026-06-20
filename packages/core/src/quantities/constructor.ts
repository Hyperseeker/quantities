/**
 * @file Defines the Quantity class along with its construction, validation, and helpers.
 */

import type {
	Aliases,
	Denominator,
	Formatter,
	Kind,
	Name,
	NonEmptyArray,
	Numerator,
	QuantityInitializer,
	QuantityString,
	UnitString,
} from "../types.ts";
import { isNonEmptyArray } from "../utils.ts";
import { QuantityError } from "./error.ts";
import { extend } from "./extensions.ts";
import { divideSafely, multiplySafely } from "./math.ts";
import parse, { globalParse } from "./parse.ts";
import { UNITY_ARRAY } from "./units.ts";

import {
	compare,
	equals,
	greaterThan,
	greaterThanOrEquals,
	isSame,
	lessThan,
	lessThanOrEquals,
	max,
	min,
} from "./comparators.ts";
import {
	_toBaseValues,
	swiftConverter,
	toBase,
	toFloat,
	toPrecision,
	toUnits,
} from "./conversion.ts";
import { DEFAULT_FORMATTER, format, toString, units } from "./format.ts";
import { getKinds, kind } from "./kind.ts";
import {
	abs,
	add,
	divide,
	exponent,
	invert,
	multiply,
	root,
	sign,
	subtract,
} from "./operators.ts";
import {
	isBase,
	isCompatible,
	isDefinitionObject,
	isDegrees,
	isInverse,
	isNumber,
	isSameRegistry,
	isString,
	isTemperature,
	isUnitless,
	isUnityArray,
} from "./predicates.ts";
import type UnitRegistry from "./registry.ts";
import { DEFAULT_REGISTRY } from "./registry.ts";

/**
 * Asserts constructor arguments are valid.
 *
 * @param value Value to test.
 * @param units Optional units when value is passed as a number.
 *
 * @throws {QuantityError} if constructor arguments are invalid.
 */
function assertValidConstructorArguments(value: unknown, units?: string): void {
	if (units) {
		if (!(isNumber(value) && isString(units)))
			throw new QuantityError(
				"assertValidConstructorArguments(): Only number accepted as initialization value when units are explicitly provided",
			);
	}

	if (
		!(
			isString(value) ||
			isNumber(value) ||
			isQuantity(value) ||
			isDefinitionObject(value)
		)
	)
		throw new QuantityError(
			"assertValidConstructorArguments(): Only `string`, `number` or `Quantity` is accepted as a single initialization value",
		);
}

/**
 * Recomputes and stores the base scalar and signature for a quantity.
 */
function updateBaseScalar(this: Quantity): void {
	const { baseScalar, signature } = _toBaseValues(this);

	this.baseScalar = baseScalar;
	this.signature = signature;
}

/**
 * Tests if a value is an instance of {@link Quantity}.
 *
 * @param value Value to test.
 *
 * @returns `true` if value is a Quantity instance, `false` otherwise.
 */
export function isQuantity(value: unknown): value is Quantity {
	return value instanceof Quantity;
}

/**
 * Ensures the input is a {@link Quantity} instance compatible with the context.
 *
 * If input is already a quantity, validates it shares the context's registry.
 * If input is a string, parses it using the context's constructor.
 *
 * @param input Quantity or quantity string to normalize.
 * @param context Quantity providing the registry and constructor to use.
 *
 * @returns A {@link Quantity} instance compatible with the context.
 *
 * @throws {QuantityError} if input is from a different registry or is neither a string nor a Quantity.
 */
export function ensureQuantity(
	input: QuantityString | Quantity,
	context: Quantity,
): Quantity {
	if (isQuantity(input)) {
		if (!isSameRegistry(input, context))
			throw new QuantityError(
				"ensureQuantity(): Cannot operate on quantities from different registries. Ensure all quantities are created with the same registry",
			);

		return input;
	}

	if (!isString(input))
		throw new QuantityError(
			"ensureQuantity(): Invalid quantity input. Expected `string` or `Quantity`",
		);

	return new (context.constructor as typeof Quantity)(input);
}

/**
 * The class representing a physical quantity with a numeric scalar and a normalized unit vector (numerator/denominator).
 */
class Quantity {
	/**
	 * Numeric value of the quantity.
	 *
	 * @example Quantity("2 m").scalar === 2
	 */
	scalar: number = 0;
	/**
	 * Base numeric value of the quantity, relative to the base unit of its category.
	 *
	 * @example Quantity("2 m").baseScalar === 2
	 * @example Quantity("10 cm").baseScalar === 0.1
	 */
	baseScalar: number = 0;
	/**
	 * Numeric value representing the category of units of the quantity.
	 */
	signature: number | null = null;

	static registry: UnitRegistry = DEFAULT_REGISTRY;
	registry: UnitRegistry = Quantity.registry;

	static formatter: Formatter = DEFAULT_FORMATTER;

	static parse = globalParse;
	static swiftConverter = swiftConverter;
	static mulSafe = multiplySafely;
	static divSafe = divideSafely;
	static getKinds = getKinds;
	static getUnits(kind?: Kind): Name[] {
		return this.registry.getUnits(kind);
	}
	static getAliases(unitName: Name): Aliases {
		return this.registry.getAliases(unitName);
	}
	static min = min;
	static max = max;
	static Error = QuantityError;
	static extend = extend;

	numerator: NonEmptyArray<Numerator> = UNITY_ARRAY;
	denominator: NonEmptyArray<Denominator> = UNITY_ARRAY;

	initialValue: unknown;

	/**
	 * The original value the quantity was constructed from.
	 *
	 * @returns The value passed to the constructor.
	 */
	get initValue(): typeof this.initialValue {
		return this.initialValue;
	}

	isTemperature(): boolean {
		return isTemperature(this);
	}
	isDegrees(): boolean {
		return isDegrees(this);
	}
	isBase(): boolean {
		return isBase(this);
	}
	isUnitless(): boolean {
		return isUnitless(this);
	}
	isCompatible(input: QuantityString | Quantity): boolean {
		return isCompatible(this, input);
	}
	isInverse(input: QuantityString | Quantity): boolean {
		return isInverse(this, input);
	}

	units(): string {
		return units(this);
	}
	kind(): string {
		return kind(this);
	}

	to(input?: QuantityString | Quantity): this {
		return toUnits(this, input) as this;
	}
	toUnits(input?: QuantityString | Quantity): this {
		return toUnits(this, input) as this;
	}
	toPrecision(input: string | number | Quantity): this {
		return toPrecision(this, input) as this;
	}
	toPrec(input: string | number | Quantity): this {
		return toPrecision(this, input) as this;
	}
	toFloat(): number {
		return toFloat(this);
	}
	toBase(): this {
		return toBase(this) as this;
	}
	toString(qualifier?: number | Quantity): string;
	toString(qualifier: QuantityString | Quantity, precision?: number): string;
	toString(
		qualifier?: string | number | Quantity,
		precision?: number,
	): string {
		return toString(this, qualifier, precision);
	}
	format(qualifier?: Formatter): string;
	format(qualifier: UnitString, formatter?: Formatter): string;
	format(qualifier?: UnitString | Formatter, formatter?: Formatter): string {
		return format(this, qualifier, formatter);
	}

	add(input: QuantityString | Quantity): this {
		return add(this, input) as this;
	}
	subtract(input: QuantityString | Quantity): this {
		return subtract(this, input) as this;
	}
	sub(input: QuantityString | Quantity): this {
		return subtract(this, input) as this;
	}
	multiply(input: string | number | Quantity): this {
		return multiply(this, input) as this;
	}
	mul(input: string | number | Quantity): this {
		return multiply(this, input) as this;
	}
	divide(input: string | number | Quantity): this {
		return divide(this, input) as this;
	}
	div(input: string | number | Quantity): this {
		return divide(this, input) as this;
	}
	invert(): this {
		return invert(this) as this;
	}
	inverse(): this {
		return invert(this) as this;
	}
	exponent(power: number): this {
		return exponent(this, power) as this;
	}
	pow(power: number): this {
		return exponent(this, power) as this;
	}
	root(power: number): this {
		return root(this, power) as this;
	}
	sqrt(): this {
		return root(this, 2) as this;
	}
	cbrt(): this {
		return root(this, 3) as this;
	}
	abs(): this {
		return abs(this) as this;
	}
	sign(): number {
		return sign(this);
	}

	equals(input: QuantityString | Quantity): boolean {
		return equals(this, input);
	}
	eq(input: QuantityString | Quantity): boolean {
		return equals(this, input);
	}
	lessThan(input: QuantityString | Quantity): boolean {
		return lessThan(this, input);
	}
	lt(input: QuantityString | Quantity): boolean {
		return lessThan(this, input);
	}
	lessThanOrEqual(input: QuantityString | Quantity): boolean {
		return lessThanOrEquals(this, input);
	}
	lte(input: QuantityString | Quantity): boolean {
		return lessThanOrEquals(this, input);
	}
	greaterThan(input: QuantityString | Quantity): boolean {
		return greaterThan(this, input);
	}
	gt(input: QuantityString | Quantity): boolean {
		return greaterThan(this, input);
	}
	greaterThanOrEqual(input: QuantityString | Quantity): boolean {
		return greaterThanOrEquals(this, input);
	}
	gte(input: QuantityString | Quantity): boolean {
		return greaterThanOrEquals(this, input);
	}
	compareTo(input: QuantityString | Quantity): number {
		return compare(this, input);
	}
	compare(input: QuantityString | Quantity): number {
		return compare(this, input);
	}
	isSame(other: Quantity): boolean {
		return isSame(this, other);
	}
	same(other: Quantity): boolean {
		return isSame(this, other);
	}

	constructor(initialValue: QuantityInitializer, initialUnits?: UnitString) {
		assertValidConstructorArguments(initialValue, initialUnits);

		// * registry comes from class inheritance
		this.registry = (this.constructor as typeof Quantity).registry;

		if (isQuantity(initialValue)) {
			this.scalar = initialValue.scalar;
			this.numerator = initialValue.numerator;
			this.denominator = initialValue.denominator;
			this.baseScalar = initialValue.baseScalar;
			this.signature = initialValue.signature;
			this.initialValue = initialValue;

			return;
		}

		if (initialUnits) {
			parse.call(this, initialUnits);

			if (isNumber(initialValue)) {
				this.scalar = initialValue;
			} else {
				throw new QuantityError(
					"Quantity(): Initialization value must be a number when units are provided",
				);
			}
		} else if (isDefinitionObject(initialValue)) {
			this.scalar = initialValue.scalar;

			const { numerator, denominator } = initialValue;

			this.numerator =
				numerator && isNonEmptyArray(numerator)
					? numerator
					: UNITY_ARRAY;

			this.denominator =
				denominator && isNonEmptyArray(denominator)
					? denominator
					: UNITY_ARRAY;
		} else if (isString(initialValue) || isNumber(initialValue)) {
			parse.call(this, initialValue);
		} else {
			throw new QuantityError("Quantity(): Invalid initialization value");
		}

		if (this.denominator.some((unit) => unit.includes("temp")))
			throw new QuantityError(
				"Quantity(): Cannot divide with temperatures",
			);

		if (this.numerator.some((unit) => unit.includes("temp"))) {
			if (this.numerator.length > 1)
				throw new QuantityError(
					"Quantity(): Cannot multiply by temperatures",
				);

			if (!isUnityArray(this.denominator))
				throw new QuantityError(
					"Quantity(): Cannot divide with temperatures",
				);
		}

		this.initialValue = initialValue;

		updateBaseScalar.call(this);

		if (this.isTemperature() && this.baseScalar < 0)
			throw new QuantityError(
				"Quantity(): Temperatures must not be less than absolute zero",
			);
	}
}

export default Quantity;
